import { describe, it, beforeEach, afterEach, expect } from "bun:test";
import {
  bootstrapContainer,
  initializeCliActioman,
  killContainer,
  prepareScript,
} from "./container";

beforeEach(async () => {
  await killContainer();
  await bootstrapContainer();
});

afterEach(async () => {
  // await killContainer()
});

describe("actioman serve command", () => {
  it("should execute the serve command successfully", async () => {
    const { shell, actioman } = await initializeCliActioman();

    await prepareScript("test_1", "app.ts");
    await prepareScript("test_1", "fetch.ts");

    await actioman("serve", "app.ts").waitForLog("Server running at");

    const { stdoutJson } = await shell("bun", "fetch.ts").exited;

    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.statusCode).toBe(200);
  });

  it("should execute the serve command with --port option", async () => {
    const { shell, actioman } = await initializeCliActioman();

    await prepareScript("test_2", "app.ts");
    await prepareScript("test_2", "fetch.ts");

    await actioman("serve", "app.ts", "--port", "40322").waitForLog(
      "Server running at",
    );

    const { stdoutJson } = await shell("bun", "fetch.ts").exited;

    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.statusCode).toBe(200);
  });

  it("should display help information", async () => {
    const { shell, actioman } = await initializeCliActioman();

    await prepareScript("test_3", "app.ts");

    const { stdoutText } = await actioman("serve", "app.ts", "--help").exited;

    expect(stdoutText).toContain("Usage:");
  });

  it("should execute the serve command and log hello action", async () => {
    const { shell, actioman } = await initializeCliActioman();

    await prepareScript("test_4", "app.ts");
    await prepareScript("test_4", "fetch.ts");

    const childProcess = await actioman("serve", "app.ts").verbose();

    let stdoutPartial: string = "";
    childProcess.stdoutSubscriber.subscribe((line) => {
      stdoutPartial += line;
    });

    await childProcess.waitForLog("Server running at");

    expect(stdoutPartial).toContain("POST /__actions/hello");
  });
});
