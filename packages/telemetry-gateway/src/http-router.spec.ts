import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { HTTPRouter } from "./http-router";
import client from "prom-client";

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

  it("should collect metrics correctly", async () => {
    const router = new HTTPRouter();

    const events: any[] = [
      {
        type: "command_execution",
        actioman_version: "1.0.0",
        command: "serve",
        duration_ms: 120,
      },
      {
        type: "command_execution",
        actioman_version: "1.1.0",
        command: "serve",
        duration_ms: 430,
      },
      {
        type: "command_execution",
        actioman_version: "1.0.0",
        command: "serve",
        plugins_active: ["foo", "taz"],
        duration_ms: 212,
      },
    ];

    for (const event of events) {
      await router.router.fetch(
        new Request("http://localhost:3000/collect", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }),
      );
    }

    console.log(await client.register.metrics());

    expect(await client.register.getMetricsAsJSON()).toMatchSnapshot();
  });
});
