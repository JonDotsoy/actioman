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
});
