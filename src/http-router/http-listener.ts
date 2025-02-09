import * as http from "http";
import { HTTPRouter } from "./http-router.js";
import type { ConfigsModule } from "../configs/configs.js";
import { sanitizeHostname } from "./utils/sanitize-hostname.js";
import { findNextPort } from "./utils/find-next-port.js";

type ListenOptions = {
  silent: boolean;
};

export const INITIAL_PORT = 30_320;

export class HTTPLister {
  server: http.Server;

  constructor(readonly httpRouter: HTTPRouter) {
    this.server = http.createServer(async (req, res) => {
      try {
        if (!(await httpRouter.router.requestListener(req, res))) {
          res.statusCode = 404;
          return res.end();
        }
      } catch (error) {
        console.error(error);
        res.statusCode = 500;
        return res.end();
      }
    });
  }

  async close() {
    await new Promise<null>((resolve, reject) => {
      if (this.server.address() === null) return resolve(null);
      this.server.close((err) => {
        if (err) return reject(err);
        return resolve(null);
      });
    });
  }

  async listen(port?: number, hostname?: string, options?: ListenOptions) {
    const silent = options?.silent ?? HTTPLister.defaultOptions.silent;

    const log = (message: string) => {
      if (silent) return;
      console.log(message);
    };

    const portToListen = port ?? (await findNextPort());
    const hostnameToListen = hostname ?? "localhost";

    const url = await new Promise<URL>((resolve) => {
      this.server.listen(portToListen, hostnameToListen, () => {
        const address = this.server.address();
        if (typeof address === "object" && address !== null)
          return resolve(
            new URL(
              `http://${sanitizeHostname(address.address)}:${address.port}`,
            ),
          );
        return resolve(
          new URL(
            `http://${sanitizeHostname(hostnameToListen)}:${portToListen}`,
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

    return url;
  }

  static fromModule(module: unknown, configs?: ConfigsModule) {
    const httpRouter = HTTPRouter.fromModule(module, configs);
    if (!httpRouter) throw new Error("No actions found");
    return new HTTPLister(httpRouter);
  }

  static defaultOptions = {
    silent: false,
  };
}
