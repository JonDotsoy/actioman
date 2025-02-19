import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { HTTPLister } from "./http-listener";
import { HTTPRouter } from "./http-router";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { DEFAULT_CERT } from "./DEFAULT_CERT";
import { DEFAULT_KEY } from "./DEFAULT_KEY";
import * as https from "https";
import * as http from "http";

describe("HTTPLister", () => {
  it("should return 404 for unknown paths", async () => {
    await using cleanupTasks = new CleanupTasks();
    const httpLister = HTTPLister.fromModule({});
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    const res = await fetch(new URL("/", url!));

    expect(res.status).toEqual(404);
  });

  it("should return 200 for /__actions", async () => {
    await using cleanupTasks = new CleanupTasks();
    const httpLister = HTTPLister.fromModule({});
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    const res = await fetch(new URL("/__actions", url!));

    expect(res.status).toEqual(200);
  });

  it("should start a server", async () => {
    await using cleanupTasks = new CleanupTasks();
    const { default: express } = await import("express");
    const app = express();
    const port = 30_161;

    const httpRouter = HTTPRouter.fromModule({ hi: () => "ok" });

    app.use("/", async (req, res, next) => {
      const ok = await httpRouter.router.requestListener(req, res);
      if (!ok) next();
    });

    const server = app.listen(port);
    cleanupTasks.add(
      () => new Promise<true>((resolve) => server.close(() => resolve(true))),
    );
  });

  describe("integration tests", () => {
    const cleanupTasks = new CleanupTasks();
    beforeAll(async () => {
      const { default: express } = await import("express");
      const app = express();
      const port = 30_161;

      const httpRouter = HTTPRouter.fromModule({ hi: () => "ok" });

      app.use("/", async (req, res, next) => {
        const ok = await httpRouter.router.requestListener(req, res);
        if (!ok) next();
      });

      const server = app.listen(port);
      cleanupTasks.add(
        () => new Promise<true>((resolve) => server.close(() => resolve(true))),
      );
    });

    afterAll(async () => {
      await cleanupTasks.cleanup();
    });

    it("should return 200 for /__actions", async () => {
      const res = await fetch("http://localhost:30161/__actions");
      expect(res.status).toEqual(200);
      expect(await res.text()).toMatchSnapshot();
    });

    it("should return 200 for /__actions/hi", async () => {
      const res = await fetch("http://localhost:30161/__actions/hi", {
        method: "POST",
      });
      expect(res.status).toEqual(200);
      expect(await res.text()).toMatchSnapshot();
    });
  });

  it("should create a server with actions", async () => {
    await using cleanupTasks = new CleanupTasks();
    const httpLister = HTTPLister.fromModule({
      biz: () => true,
      foo: () => true,
      taz: () => true,
    });
    cleanupTasks.add(() => httpLister.close());
    await httpLister.listen();
  });

  it("should create a server with ssl", async () => {
    await using cleanupTasks = new CleanupTasks();
    const httpLister = HTTPLister.fromModule(
      {
        hi: () => "",
      },
      {
        server: {
          ssl: {
            key: DEFAULT_KEY,
            cert: DEFAULT_CERT,
          },
        },
      },
    );
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    expect(url.protocol).toEqual("https:");

    const res = await new Promise<http.IncomingMessage>((resolve, reject) => {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      https
        .request(new URL("./__actions", url))
        .end()
        .addListener("connect", () => {
          console.log("connect");
        })
        .addListener("close", () => {
          console.log("end");
        })
        .addListener("error", (err) => {
          reject(err);
        })
        .addListener("response", (res) => {
          resolve(res);
        });
    });

    expect(res.statusCode).toEqual(200);
  });
});
