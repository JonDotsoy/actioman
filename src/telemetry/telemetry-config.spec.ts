import { describe, it, expect } from "bun:test";
import { defaultTelemetryConfig } from "./telemetry-config";

describe("_", () => {
  it("test 1", () => {
    console.log(defaultTelemetryConfig());
  });
});
