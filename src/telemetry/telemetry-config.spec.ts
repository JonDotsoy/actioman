import { describe, it, expect, spyOn } from "bun:test";
import { defaultTelemetryConfig } from "./telemetry-config";

describe("TelemetryConfig", () => {
  it("defaultTelemetryConfig", () => {
    console.log(defaultTelemetryConfig());
  });
});
