import {
  describe,
  it,
  mock,
  beforeEach,
  expect,
  beforeAll,
  afterAll,
} from "bun:test";
import { Telemetry } from "./telemetry";
import { defaultTelemetryConfig } from "./telemetry-config";

const globalFetch = globalThis.fetch;
const fetchMock = mock<(...args: any[]) => any>(globalThis.fetch);

beforeAll(() => {
  globalThis.fetch = fetchMock;
});

afterAll(() => {
  globalThis.fetch = globalFetch;
});

describe("Telemetry", () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  it("should send messages", async () => {
    const telemetry = new Telemetry(
      defaultTelemetryConfig({ enabled: true }),
    ).start();

    await new Promise((r) => setTimeout(r, 20));
    telemetry.push({
      type: "command_execution",
      command: "serve",
    });
    telemetry.push({
      type: "command_execution",
      command: "serve",
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(fetchMock).toBeCalled();
  });

  it("should send all messages", async () => {
    const versionPromises: Record<
      string,
      { promise: Promise<void>; resolve: () => void }
    > = {
      serve_1: Promise.withResolvers(),
      serve_2: Promise.withResolvers(),
      serve_3: Promise.withResolvers(),
    };

    fetchMock.mockImplementation((url, body) => {
      versionPromises[
        JSON.parse(new TextDecoder().decode(body.body)).command
      ]?.resolve();
    });

    const telemetry = new Telemetry(
      defaultTelemetryConfig({
        enabled: true,
        debug: true,
        verbose: true,
      }),
    ).start();

    await new Promise((r) => setTimeout(r, 20));
    telemetry.push({
      type: "command_execution",
      command: "serve_1",
    });
    telemetry.push({
      type: "command_execution",
      command: "serve_2",
    });
    await new Promise((r) => setTimeout(r, 20));
    telemetry.push({
      type: "command_execution",
      command: "serve_3",
    });

    await Promise.all(Object.values(versionPromises).map((a) => a.promise));
  });
});
