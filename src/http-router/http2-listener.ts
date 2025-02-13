import { HTTPRouter } from "./http-router.js";
import type { ConfigsModule } from "../configs/configs.js";
import { sanitizeHostname } from "./utils/sanitize-hostname.js";
import { findNextPort } from "./utils/find-next-port.js";
import * as http2 from "http2";
import { requestHttp2ToRequest } from "./utils/request-http2-to-request.js";

type ListenOptions = {
  silent: boolean;
};

export const INITIAL_PORT = 30_320;

export class HTTP2Lister {
  server: http2.Http2Server;
  url: URL | undefined;
  isSecure: boolean;

  constructor(
    readonly httpRouter: HTTPRouter,
    readonly configs?: ConfigsModule,
  ) {
    const key = configs?.server?.ssl?.key;
    const cert = configs?.server?.ssl?.cert;

    this.isSecure = key !== undefined && cert !== undefined;

    const createServer = (
      onRequestHandler?: (
        request: http2.Http2ServerRequest,
        response: http2.Http2ServerResponse,
      ) => void,
    ) => {
      if (this.isSecure) {
        return http2.createSecureServer(
          { key, cert, settings: { initialWindowSize: 8 * 1024 * 1024 } },
          onRequestHandler,
        );
      }
      return http2.createServer(
        { settings: { initialWindowSize: 8 * 1024 * 1024 } },
        onRequestHandler,
      );
    };

    this.server = createServer(async (requestHttp2, responseHttp2) => {
      try {
        // console.log(r)

        const response = await this.httpRouter.router.fetch(
          requestHttp2ToRequest(requestHttp2),
        );

        if (!response) {
          responseHttp2.statusCode = 404;
          return responseHttp2.end();
        }

        responseHttp2.statusCode = response.status;
        response.headers.forEach((value, key) => {
          if (key.startsWith(":")) return;
          if (responseHttp2.hasHeader(key)) {
            responseHttp2.appendHeader(key, value);
          } else {
            responseHttp2.setHeader(key, value);
          }
        });
        if (response.body) {
          const reader = response.body.getReader();
          for (
            let readResult = await reader.read();
            !readResult.done && !requestHttp2.aborted;
            readResult = await reader.read()
          ) {
            responseHttp2.write(readResult.value);
          }
        }
        return responseHttp2.end();
      } catch (error) {
        console.error(error);
        responseHttp2.statusCode = 500;
        return responseHttp2.end();
      }
    });
  }

  async close() {
    await new Promise<null>((resolve, reject) => {
      if (this.server.address() === null) return resolve(null);
      this.server.close();
      return resolve(null);
    });
  }

  async listen(port?: number, hostname?: string, options?: ListenOptions) {
    const silent = options?.silent ?? HTTP2Lister.defaultOptions.silent;

    const log = (message: string) => {
      if (silent) return;
      console.log(message);
    };

    const portToListen =
      port ?? this.configs?.server?.port ?? (await findNextPort());
    const hostnameToListen = hostname ?? this.configs?.server?.host ?? "::";

    const url = await new Promise<URL>((resolve) => {
      this.server.listen(portToListen, hostnameToListen, () => {
        const protocol = this.isSecure ? "https" : "http";
        const address = this.server.address();
        if (typeof address === "object" && address !== null)
          return resolve(
            new URL(
              `${protocol}://${sanitizeHostname(address.address)}:${address.port}`,
            ),
          );
        return resolve(
          new URL(
            `${protocol}://${sanitizeHostname(hostnameToListen)}:${portToListen}`,
          ),
        );
      });
    });

    if (!silent) {
      for (const route of this.httpRouter.router.routes) {
        const method = route.method;
        const urlPattern = route.urlPattern;
        log(`Route ${method} ${urlPattern.pathname}`);
      }
    }
    log(`Listening on ${url.toString()}`);

    this.url = url;

    return url;
  }

  static fromModule(module: unknown, configs?: ConfigsModule) {
    const httpRouter = HTTPRouter.fromModule(module, configs);
    if (!httpRouter) throw new Error("No actions found");
    return new HTTP2Lister(httpRouter, configs);
  }

  static defaultOptions = {
    silent: false,
  };
}

export const HTTPLister = HTTP2Lister;
