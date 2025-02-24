import { describe, expect, it } from "bun:test";
import { defineAction } from "../actions/actions";
import { HTTPRouter } from "./http-router";
import { z } from "zod";

describe("HTTPRouter", () => {
  it("should create a router from a module", () => {
    const httpRouter = HTTPRouter.fromModule({
      foo: () => "ok",
    });

    expect(httpRouter).not.toBeNull();
  });
  it("should return null if the module is invalid", () => {
    expect(() => HTTPRouter.fromModule(null)).toThrow();
    expect(() => HTTPRouter.fromModule("")).toThrow();
    expect(() => HTTPRouter.fromModule(1)).toThrow();
    expect(() => HTTPRouter.fromModule(false)).toThrow();
    expect(() => HTTPRouter.fromModule(true)).toThrow();
    expect(() => HTTPRouter.fromModule(undefined)).toThrow();
  });

  it("should handle actions with zod validation", async () => {
    const httpRouter = HTTPRouter.fromModule({
      foo: () => "ok",
      taz: defineAction({
        input: z.object({
          name: z.string().optional(),
        }),
        handler: async () => "ok",
      }),
    });

    const res = await httpRouter?.router.fetch(
      new Request("http://localhost/__actions"),
    );
    expect(res?.status).toEqual(200);
    expect(res?.headers.get("Content-Type")).toStartWith("application/json");
    expect(await res?.json()).toMatchSnapshot();
  });

  it("should handle actions without zod validation", async () => {
    const httpRouter = HTTPRouter.fromModule({
      foo: () => "ok",
    });

    const res = await httpRouter?.router.fetch(
      new Request("http://localhost/__actions/foo", { method: "POST" }),
    );
    expect(res?.status).toEqual(200);
    expect(res?.headers.get("Content-Type")).toStartWith("application/json");
    expect(await res?.json()).toMatchSnapshot();
  });

  it("should handle sse actions", async () => {
    const httpRouter = HTTPRouter.fromModule({
      async *f1() {
        yield { a: 1 };
        yield "2";
      },
    });

    const res = await httpRouter.router.fetch(
      new Request("http://localhost/__actions/f1", { method: "GET" }),
    );
    const controlCacheHeader = res?.headers.get("Cache-Control");
    const contentTypeHeader = res?.headers.get("Content-Type");
    const statusCode = res?.status;
    const body = await res?.text();

    expect(statusCode).toEqual(200);
    expect(controlCacheHeader).toEqual("no-cache");
    expect(contentTypeHeader).toEqual("text/event-stream");
    expect(body).toMatchSnapshot();
  });
});
