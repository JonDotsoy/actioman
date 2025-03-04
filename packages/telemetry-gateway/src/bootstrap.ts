import { config } from "./config";
import { HTTPRouter } from "./http-router";

const MB = 1024 * 1024;

const httpRouter = new HTTPRouter();

const server = Bun.serve({
  port: config.port,
  hostname: config.hostname,
  fetch: async (req) => await httpRouter.router.fetch(req),
  maxRequestBodySize: MB / 2,
});

console.log(`Listening on ${server.url}`);
