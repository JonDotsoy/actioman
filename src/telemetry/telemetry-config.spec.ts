import { describe, it, expect, spyOn } from "bun:test";
import { defaultTelemetryConfig } from "./telemetry-config";

describe("TelemetryConfig", () => {
  it("defaultTelemetryConfig", () => {
    expect(defaultTelemetryConfig()).toMatchSnapshot();
  });
});
