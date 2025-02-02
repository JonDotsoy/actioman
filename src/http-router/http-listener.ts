import * as http from "http";
import { HTTPRouter } from "./http-router.js";
import net from "net";
import type { ConfigsModule } from "../configs/configs.js";

type ListenOptions = {
  silent: boolean;
};

const sanatizeHostname = (hostname: string) => {
  switch (hostname) {
    case "::1":
    case "::":
    case "0.0.0.0":
    case "127.0.0.1":
    case "::ffff:127.0.0.1":
      return "localhost";
  }

  return hostname;
};

const INITIAL_PORT = 30_320;

const findNextPort = async () => {
  let porposalPort = INITIAL_PORT;
  while (true) {
    porposalPort++;
    if (porposalPort >= INITIAL_PORT + 10_000)
      throw new Error("No available port");
    const port = await new Promise<number | null>((resolve) => {
      const connectiong = net.connect({
        host: "localhost",
        port: porposalPort,
      });

      connectiong.addListener("connect", () => {
        resolve(null);
        connectiong.destroy();
      });
      connectiong.addListener("error", (err) => {
        if ("code" in err && err.code === "ECONNREFUSED") resolve(porposalPort);
      });
    });
    if (typeof port === "number") return port;
  }
};

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
              `http://${sanatizeHostname(address.address)}:${address.port}`,
            ),
          );
        return resolve(
          new URL(
            `http://${sanatizeHostname(hostnameToListen)}:${portToListen}`,
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
