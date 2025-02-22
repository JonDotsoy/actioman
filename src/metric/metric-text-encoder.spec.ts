import { describe, expect, it, test } from "bun:test";
import { MetricTextEncoder } from "./metric-text-encoder";

describe("MetricTextEncode", () => {
  it("encode metrics", () => {
    expect(new MetricTextEncoder().encode({ name: "sd", value: 32 })).toEqual(
      `sd 32`,
    );
    expect(
      new MetricTextEncoder().encode({
        name: "name",
        labels: { foo: "hello" },
        value: 32,
      }),
    ).toEqual(`name{foo="hello"} 32`);
    expect(
      new MetricTextEncoder().encode({
        name: "http_requests_total",
        labels: { method: "post", code: "200" },
        value: 1027,
        timestamp: 1395066363000,
      }),
    ).toEqual(
      `http_requests_total{method="post",code="200"} 1027 1395066363000`,
    );
  });
});
