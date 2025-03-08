import { config } from "./config";
import { HTTPRouter } from "./http-router";

const MB = 1024 * 1024;

const httpRouter = new HTTPRouter();

const server = Bun.serve({
  port: config.port,
  hostname: config.hostname,
  fetch: async (req, server) => {
    const requestIp =
      req.headers.get("X-Forwarded-For") ?? server.requestIP(req)?.address;
    if (requestIp) req.headers.set("X-Forwarded-For", requestIp);
    return await httpRouter.router.fetch(req);
  },
  maxRequestBodySize: MB / 2,
});

console.log(`Listening on ${server.url}`);
