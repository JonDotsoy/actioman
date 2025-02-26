import { describe, it, expect, setSystemTime, afterAll } from "bun:test";
import { HTTPLister } from "../http-router/http-listener";
import { metrics } from "./metrics";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";

let port = 12000;

describe("Metrics Integration", () => {
  afterAll(() => setSystemTime());

  it("should expose metrics endpoint", async () => {
    await using cleanupTasks = new CleanupTasks();

    const httpLister = await HTTPLister.fromModule(
      {
        hi: () => "hello",
      },
      {
        integrations: [metrics()],
      },
    );

    cleanupTasks.add(() => httpLister.close());

    const url = await httpLister.listen(port++);

    console.log("checking url+port for tests", { url });

    const res = await fetch(new URL("/metrics", url));
    expect(res.status).toBe(200);
    expect(await res.text()).toMatchSnapshot();
  });

  it("should expose metrics endpoint with data", async () => {
    await using cleanupTasks = new CleanupTasks();
    setSystemTime(1000);

    const httpLister = await HTTPLister.fromModule(
      {
        hi: async () => {
          setSystemTime(1200);
          return "hello";
        },
      },
      {
        integrations: [metrics()],
      },
    );

    cleanupTasks.add(() => httpLister.close());

    const url = await httpLister.listen(port++);

    await fetch(new URL("/__actions/hi", url), { method: "POST" });

    const res = await fetch(new URL("/metrics", url));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toEqual(
      expect.stringContaining("text/plain"),
    );
    expect(await res.text()).toMatchSnapshot();
  });
});
