import { describe, it, beforeAll, expect, afterEach } from "bun:test";
import {
  cleanupContainer,
  setupContainer,
} from "./container/src/setup_container";
import { initializeContainerCliHelpers } from "./container/src/initialize_container_cli_helpers";
import { setupWorkspaceForTesting } from "./container/src/setup_workspace_for_testing";

const test1ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_1",
  files: ["fetch.ts", "app.ts"],
});

const test2ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_2",
  files: ["fetch.ts", "app.ts"],
});

const test3ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_3",
  files: ["app.ts"],
});

const test4ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_4",
  files: ["app.ts", "fetch.ts"],
});

const test5ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_5",
  files: ["actioman.config.ts", "app.ts"],
});

const test6ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_6",
  files: [".actioman.config.ts", "app.ts"],
});

const test7ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_7",
  files: [".actioman.config.js", "app.ts"],
});

const test8ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_8",
  files: ["actioman.config.js", "app.ts"],
});

const test9ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_9",
  files: ["server.ts", "app.ts"],
  initWorkspace: true,
  installActioman: true,
});

const test10ContainerCliHelpers = setupWorkspaceForTesting({
  name: "test_10",
  files: ["first-server.ts", "second-server.ts", "app.ts"],
  initWorkspace: true,
  installActioman: true,
});

beforeAll(async () => {
  await setupContainer();
});

afterEach(async () => {
  await cleanupContainer();
});

describe("actioman serve command", () => {
  beforeAll(async () => {
    await test1ContainerCliHelpers.initialize();
    await test2ContainerCliHelpers.initialize();
    await test3ContainerCliHelpers.initialize();
    await test4ContainerCliHelpers.initialize();
    await test5ContainerCliHelpers.initialize();
    await test6ContainerCliHelpers.initialize();
    await test7ContainerCliHelpers.initialize();
    await test8ContainerCliHelpers.initialize();
  });

  // $ actioman serve app.ts
  it("should execute the serve command successfully", async () => {
    const { shell, actioman } = await test1ContainerCliHelpers.result();

    await actioman("serve", "app.ts").waitForLog("Server running at");

    const { stdoutJson } = await shell("bun", "fetch.ts").exited;

    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.statusCode).toBe(200);
  });

  // $ actioman serve app.ts --port 30333
  it("should execute the serve command with --port option", async () => {
    const { shell, actioman } = await test2ContainerCliHelpers.result();

    await actioman("serve", "app.ts", "--port", "30333").waitForLog(
      "Server running at",
    );

    const { stdoutJson } = await shell("bun", "fetch.ts").exited;

    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.statusCode).toBe(200);
  });

  // $ actioman serve app.ts --help
  it("should display help information", async () => {
    const { shell, actioman } = await test3ContainerCliHelpers.result();

    const { stdoutText } = await actioman("serve", "app.ts", "--help").exited;

    expect(stdoutText).toContain("Usage:");
  });

  // $ actioman serve app.ts
  it("should execute the serve command and log hello action", async () => {
    const { shell, actioman } = await test4ContainerCliHelpers.result();

    const childProcess = await actioman("serve", "app.ts");

    let stdoutPartial: string = "";
    childProcess.stdoutSubscriber.subscribe((line) => {
      stdoutPartial += line;
    });

    await childProcess.waitForLog("Server running at");

    const { stdoutJson } = await shell("bun", "fetch.ts").exited;

    expect(stdoutPartial).toContain("POST /__actions/hello");
    expect(stdoutJson.ok).toBe(true);
    expect(stdoutJson.text).toBe(JSON.stringify("Hello from app.ts"));
  });

  // $ actioman serve app.ts
  it("should execute the serve command with actioman.config.ts", async () => {
    const { shell, actioman } = await test5ContainerCliHelpers.result();

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling actioman.config.ts");
    await childProcess.waitForLog("Server running at");
  });

  // $ actioman serve app.ts
  it("should load configuration from .actioman.config.ts file", async () => {
    const { shell, actioman } = await test6ContainerCliHelpers.result();

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling .actioman.config.ts");
    await childProcess.waitForLog("Server running at");
  });

  // $ actioman serve app.ts
  it("should load configuration from .actioman.config.js file", async () => {
    const { shell, actioman } = await test7ContainerCliHelpers.result();

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling .actioman.config.js");
    await childProcess.waitForLog("Server running at");
  });

  // $ actioman serve app.ts
  it("should load configuration from actioman.config.js file", async () => {
    const { shell, actioman } = await test8ContainerCliHelpers.result();

    const childProcess = await actioman("serve", "app.ts");

    await childProcess.waitForLog("calling actioman.config.js");
    await childProcess.waitForLog("Server running at");
  });
});

describe("actioman version command", () => {
  // $ actioman version
  it("should display the current version", async () => {
    const { actioman } = await initializeContainerCliHelpers();
    const { stdoutText } = await actioman("version").exited;

    expect(stdoutText).toContain("Actioman version:");
  });

  // $ actioman version --help
  it("should display help information", async () => {
    const { actioman } = await initializeContainerCliHelpers();
    const { stdoutText } = await actioman("version", "--help").exited;

    expect(stdoutText).toContain("Usage:");
    expect(stdoutText).toMatchSnapshot();
  });

  // $ actioman version -h
  it("should display help information with short flag", async () => {
    const { actioman } = await initializeContainerCliHelpers();
    const { stdoutText } = await actioman("version", "-h").exited;

    expect(stdoutText).toContain("Usage:");
  });

  // $ actioman version -j
  it("should display the version in JSON format", async () => {
    const { actioman } = await initializeContainerCliHelpers();
    const { stdoutText } = await actioman("version", "-j").exited;

    expect(stdoutText).toContain(`"version":`);
  });

  // $ actioman version --json
  it("should display the version in JSON format with --json flag", async () => {
    const { actioman } = await initializeContainerCliHelpers();
    const { stdoutText } = await actioman("version", "--json").exited;
    expect(stdoutText).toContain('"version":');
  });

  // $ actioman version -j -z
  it("should display the version in JSON format ending with NUL when using -j -z", async () => {
    const { actioman } = await initializeContainerCliHelpers();
    const { stdoutText } = await actioman("version", "-j", "-z").exited;
    expect(stdoutText.endsWith("\0")).toBe(true);
    expect(stdoutText).toContain('"version":');
  });

  // $ actioman version -z
  it("should display the version ending with NUL when using -z", async () => {
    const { actioman } = await initializeContainerCliHelpers();
    const { stdoutText } = await actioman("version", "-z").exited;
    expect(stdoutText.endsWith("\0")).toBe(true);
    expect(stdoutText).toContain("Actioman version:");
  });
});

describe("actioman services manager commands", () => {
  beforeAll(async () => {
    await test9ContainerCliHelpers.initialize();
    await test10ContainerCliHelpers.initialize();
  });

  // $ actioman serve server.ts
  // $ actioman add first-service http://localhost:30321/
  // $ bun app.ts // should print "Hello from server.ts"
  it("should add a service and verify output from app.ts", async () => {
    const { actioman, shell } = await test9ContainerCliHelpers.result();

    await actioman("serve", "server.ts").waitForLog("Server running at");
    await actioman("add", "first-service", "http://localhost:30321/").exited;

    const { stdoutText } = await shell("bun", "app.ts").exited;

    expect(stdoutText).toContain("Hello from server.ts");
  });

  // $ actioman serve server.ts --port 30322
  // $ actioman serve server.ts --port 30323
  // $ actioman add first-service http://localhost:30322/
  // $ actioman add second-service http://localhost:30323/
  // $ bun app.ts // should print "Hello from first-service" and "Hello from second-service"
  it("should add multiple services and verify output from app.ts", async () => {
    const { actioman, shell } = await test10ContainerCliHelpers.result();

    await actioman("serve", "first-server.ts", "--port", "30322").waitForLog(
      "Server running at",
    );
    await actioman("serve", "second-server.ts", "--port", "30323").waitForLog(
      "Server running at",
    );

    await actioman("add", "first-service", "http://localhost:30322/").exited;
    await actioman("add", "second-service", "http://localhost:30323/").exited;

    const { stdoutText } = await shell("bun", "app.ts").exited;

    expect(stdoutText).toContain("Hello from first server!");
    expect(stdoutText).toContain("Hello from second server!");
  });
});
