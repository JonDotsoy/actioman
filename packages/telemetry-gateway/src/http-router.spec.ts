import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { HTTPRouter } from "./http-router";
import client from "prom-client";
import { defaultRegistry } from "./metrics_control/registers/default_serie_register";

describe("HTTPRouter", () => {
  afterEach(() => {
    client.register.resetMetrics();
  });

  it("should return 200 when a valid payload is sent", async () => {
    const router = new HTTPRouter();

    const res = await router.router.fetch(
      new Request("http://localhost:3000/collect", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "command_execution",
          actioman_version: "1.0.0",
          command: "serve",
          duration_ms: 640,
        }),
      }),
    );

    expect(res.status).toEqual(200);
  });
});
