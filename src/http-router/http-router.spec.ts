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
    expect(HTTPRouter.fromModule(null)).toBeNull();
    expect(HTTPRouter.fromModule("")).toBeNull();
    expect(HTTPRouter.fromModule(1)).toBeNull();
    expect(HTTPRouter.fromModule(false)).toBeNull();
    expect(HTTPRouter.fromModule(true)).toBeNull();
    expect(HTTPRouter.fromModule(undefined)).toBeNull();
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
});
