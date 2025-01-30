import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { HTTPLister } from "./http-listener";
import { HTTPRouter } from "./http-router";

const cleanupTasks = new Set<() => any>();

describe("HTTPLister", () => {
  afterEach(async () => {
    for (const cleanupTask of cleanupTasks) await cleanupTask();
  });

  it("should return 404 for unknown paths", async () => {
    const httpLister = HTTPLister.fromModule({});
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    const res = await fetch(new URL("/", url!));

    expect(res.status).toEqual(404);
  });

  it("should return 200 for /__actions", async () => {
    const httpLister = HTTPLister.fromModule({});
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    const res = await fetch(new URL("/__actions", url!));

    expect(res.status).toEqual(200);
  });

  it("should start a server", async () => {
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
    const httpLister = HTTPLister.fromModule({
      biz: () => true,
      foo: () => true,
      taz: () => true,
    });
    cleanupTasks.add(() => httpLister.close());
    await httpLister.listen();
  });
});
