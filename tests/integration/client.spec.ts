import { describe, it, beforeAll, afterAll, expect, afterEach } from "bun:test";
import {
  cleanupContainer,
  setupContainer,
} from "./container/src/setup_container";
import { prepareScript } from "./container/src/prepare_script";
import { initializeActiomanCli } from "./container/src/initialize_actioman_cli";

beforeAll(async () => {
  await setupContainer();
});

afterAll(async () => {
  await cleanupContainer();
});

describe("actioman serve command", () => {
  it("test bootstrap container", async () => {});

  it("should execute the serve command successfully", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_1", "app.ts");
    await prepareScript("test_1", "fetch.ts");

    await actioman("serve", "app.ts").waitForLog("Server running at");

    const { stdoutJson } = await shell("bun", "fetch.ts").exited;

    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.statusCode).toBe(200);
  });

  it("should execute the serve command with --port option", async () => {
    const { shell, actioman } = await initializeActiomanCli();

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
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_3", "app.ts");

    const { stdoutText } = await actioman("serve", "app.ts", "--help").exited;

    expect(stdoutText).toContain("Usage:");
  });

  it("should execute the serve command and log hello action", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_4", "app.ts");
    await prepareScript("test_4", "fetch.ts");

    const childProcess = await actioman("serve", "app.ts");

    let stdoutPartial: string = "";
    childProcess.stdoutSubscriber.subscribe((line) => {
      stdoutPartial += line;
    });

    await childProcess.waitForLog("Server running at");
    const { stdoutJson } = await shell("bun", "fetch.ts").verbose().exited;
    console.log("🚀 ~ it ~ stdoutJson:", stdoutJson);

    expect(stdoutPartial).toContain("POST /__actions/hello");
    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.body).toBe("Hello from app.ts");
  });

  it("should execute the serve command with actioman.config.ts", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_5", "actioman.config.ts");
    await prepareScript("test_5", "app.ts");

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling actioman.config.ts");
    await childProcess.waitForLog("Server running at");
  });

  it("should load configuration from .actioman.config.ts file", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_6", ".actioman.config.ts");
    await prepareScript("test_6", "app.ts");

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling .actioman.config.ts");
    await childProcess.waitForLog("Server running at");
  });

  it("should load configuration from .actioman.config.js file", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_7", ".actioman.config.js");
    await prepareScript("test_7", "app.ts");

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling .actioman.config.js");
    await childProcess.waitForLog("Server running at");
  });

  it("should load configuration from actioman.config.js file", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_8", "actioman.config.js");
    await prepareScript("test_8", "app.ts");

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling actioman.config.js");
    await childProcess.waitForLog("Server running at");
  });
});
