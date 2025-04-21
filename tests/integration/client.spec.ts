import { describe, it, beforeAll, expect, afterEach } from "bun:test";
import {
  cleanupContainer,
  setupContainer,
} from "./container/src/setup_container";
import { prepareScript } from "./container/src/prepare_script";
import { initializeActiomanCli } from "./container/src/initialize_actioman_cli";

beforeAll(async () => {
  await setupContainer();
});

describe("actioman serve command", () => {
  afterEach(async () => {
    await cleanupContainer();
  });

  // $ actioman serve app.ts
  it("should execute the serve command successfully", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_1", "app.ts");
    await prepareScript("test_1", "fetch.ts");

    await actioman("serve", "app.ts").waitForLog("Server running at");

    const { stdoutJson } = await shell("bun", "fetch.ts").exited;

    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.statusCode).toBe(200);
  });

  // $ actioman serve app.ts --port 30333
  it("should execute the serve command with --port option", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_2", "app.ts");
    await prepareScript("test_2", "fetch.ts");

    await actioman("serve", "app.ts", "--port", "30333").waitForLog(
      "Server running at",
    );

    const { stdoutJson } = await shell("bun", "fetch.ts").exited;

    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.statusCode).toBe(200);
  });

  // $ actioman serve app.ts --help
  it("should display help information", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_3", "app.ts");

    const { stdoutText } = await actioman("serve", "app.ts", "--help").exited;

    expect(stdoutText).toContain("Usage:");
  });

  // $ actioman serve app.ts
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

    expect(stdoutPartial).toContain("POST /__actions/hello");
    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.text).toBe(JSON.stringify("Hello from app.ts"));
  });

  // $ actioman serve app.ts
  it("should execute the serve command with actioman.config.ts", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_5", "actioman.config.ts");
    await prepareScript("test_5", "app.ts");

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling actioman.config.ts");
    await childProcess.waitForLog("Server running at");
  });

  // $ actioman serve app.ts
  it("should load configuration from .actioman.config.ts file", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_6", ".actioman.config.ts");
    await prepareScript("test_6", "app.ts");

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling .actioman.config.ts");
    await childProcess.waitForLog("Server running at");
  });

  // $ actioman serve app.ts
  it("should load configuration from .actioman.config.js file", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_7", ".actioman.config.js");
    await prepareScript("test_7", "app.ts");

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling .actioman.config.js");
    await childProcess.waitForLog("Server running at");
  });

  // $ actioman serve app.ts
  it("should load configuration from actioman.config.js file", async () => {
    const { shell, actioman } = await initializeActiomanCli();

    await prepareScript("test_8", "actioman.config.js");
    await prepareScript("test_8", "app.ts");

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling actioman.config.js");
    await childProcess.waitForLog("Server running at");
  });
});

describe("actioman version command", () => {
  afterEach(async () => {
    await cleanupContainer();
  });

  // $ actioman version
  it("should display the current version", async () => {
    const { actioman } = await initializeActiomanCli();
    const { stdoutText } = await actioman("version").exited;

    expect(stdoutText).toContain("Actioman version:");
  });

  // $ actioman version --help
  it("should display help information", async () => {
    const { actioman } = await initializeActiomanCli();
    const { stdoutText } = await actioman("version", "--help").exited;

    expect(stdoutText).toContain("Usage:");
  });

  // $ actioman version -h
  it("should display help information with short flag", async () => {
    const { actioman } = await initializeActiomanCli();
    const { stdoutText } = await actioman("version", "-h").exited;

    expect(stdoutText).toContain("Usage:");
  });

  // $ actioman version -j
  it("should display the version in JSON format", async () => {
    const { actioman } = await initializeActiomanCli();
    const { stdoutText } = await actioman("version", "-j").exited;

    expect(stdoutText).toContain(`"version":`);
  });

  // $ actioman version --json
  it("should display the version in JSON format with --json flag", async () => {
    const { actioman } = await initializeActiomanCli();
    const { stdoutText } = await actioman("version", "--json").exited;
    expect(stdoutText).toContain('"version":');
  });

  // $ actioman version -j -z
  it("should display the version in JSON format ending with NUL when using -j -z", async () => {
    const { actioman } = await initializeActiomanCli();
    const { stdoutText } = await actioman("version", "-j", "-z").exited;
    expect(stdoutText.endsWith("\0")).toBe(true);
    expect(stdoutText).toContain('"version":');
  });

  // $ actioman version -z
  it("should display the version ending with NUL when using -z", async () => {
    const { actioman } = await initializeActiomanCli();
    const { stdoutText } = await actioman("version", "-z").exited;
    expect(stdoutText.endsWith("\0")).toBe(true);
    expect(stdoutText).toContain("Actioman version:");
  });
});
