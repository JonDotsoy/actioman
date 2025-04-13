import { spawn } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";

const containerPidPath = new URL(".container_pid", import.meta.url);
const projectLocalPath = new URL("../../", import.meta.url);
const cacheLocalPath = new URL(".cache/", import.meta.url);
const cacheProjectLocalPath = new URL("project/", cacheLocalPath);
const scriptsLocalPath = new URL("scripts/", import.meta.url);
const actiomanSourceContainerPath = new URL("file:///usr/share/actioman/");
const bunSourceContainerPath = new URL("file:///root/.bun/");
const appSourceContainerPath = new URL("file:///app/");

await fs.mkdir(cacheLocalPath, { recursive: true });
await fs.mkdir(cacheProjectLocalPath, { recursive: true });
await fs.mkdir(scriptsLocalPath, { recursive: true });

const IMAGE_NAME = "oven/bun:latest";
const CONTAINER_TIMEOUT_SECONDS = /* 10 minutes */ 10 * 60;

export const concatUint8Array = (buffers: Uint8Array[]): Uint8Array => {
  // Calculate total length
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);

  // Create a new Uint8Array with the total length
  const result = new Uint8Array(totalLength);

  // Copy each buffer into the result array
  let offset = 0;
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }

  return result;
};

type ExitedDockerProcess = {
  exitCode: number | null;
  stdout: Uint8Array;
  stderr: Uint8Array;
  stdoutText: string;
  stderrText: string;
};

class DockerProcess {
  constructor(
    public readonly stdout: ReadableStream<Uint8Array>,
    public readonly stderr: ReadableStream<Uint8Array>,
    public readonly exited: Promise<ExitedDockerProcess>,
    private readonly verboseStatus: { current: boolean },
  ) {}

  verbose(): this {
    this.verboseStatus.current = true;
    return this;
  }
}

export const docker = (...args: string[]): DockerProcess => {
  let verbose = { current: false };
  const stdoutBuffer: Uint8Array[] = [];
  const stderrBuffer: Uint8Array[] = [];
  let stdoutReadableController: null | ReadableStreamDefaultController<Uint8Array> =
    null;
  let stderrReadableController: null | ReadableStreamDefaultController<Uint8Array> =
    null;
  const stdoutReadable = new ReadableStream<Uint8Array>({
    start: (c) => (stdoutReadableController = c),
  });
  const stderrReadable = new ReadableStream<Uint8Array>({
    start: (c) => (stderrReadableController = c),
  });

  // console.log(`[Docker Command]: docker ${args.join(" ")}`);
  const childProcess = spawn("docker", args, {
    stdio: "pipe",
    shell: true,
  });

  childProcess.stdout?.on("data", (data: Uint8Array) => {
    if (verbose) process.stdout.write(data);
    stdoutReadableController?.enqueue(data);
    stdoutBuffer.push(data);
  });

  childProcess.stderr?.on("data", (data: Uint8Array) => {
    if (verbose) process.stderr.write(data);
    stderrReadableController?.enqueue(data);
    stderrBuffer.push(data);
  });

  const exited = new Promise<ExitedDockerProcess>((resolve, reject) => {
    childProcess.on("close", (code) => {
      stderrReadableController?.close();
      stdoutReadableController?.close();
      return resolve({
        exitCode: code,
        stdout: concatUint8Array(stdoutBuffer),
        stderr: concatUint8Array(stderrBuffer),
        stdoutText: new TextDecoder().decode(concatUint8Array(stdoutBuffer)),
        stderrText: new TextDecoder().decode(concatUint8Array(stderrBuffer)),
      });
    });
  });

  return new DockerProcess(stdoutReadable, stderrReadable, exited, verbose);
};

export const getStoredContainerPID = async () => {
  if (fsSync.existsSync(containerPidPath)) {
    const pidPayload = await fs.readFile(containerPidPath, "utf-8");
    const pid = pidPayload.trim();
    if (pid) {
      try {
        const { stdout } = await docker(
          "inspect",
          pid,
          "--format",
          "{{.State.Status}}",
        ).exited;
        const stateStatus = new TextDecoder().decode(stdout).trim();
        if (stateStatus === "running") {
          return pid;
        }
      } catch (error) {
        return null;
      }
    }
  }
  return null;
};

export const storeContainerPID = async (pid: string) => {
  await fs.writeFile(containerPidPath, pid);
};

export const bootstrapContainer = async () => {
  const storedPID = await getStoredContainerPID();

  if (storedPID) {
    // console.log("Container already running with PID:", storedPID);
    return storedPID;
  }

  const { stdout } = await docker(
    "run",
    "-d",
    "--rm",
    "-p",
    "30321:30321",
    "--workdir",
    appSourceContainerPath.pathname,
    // volumes
    ...["./src", "./package.json", "./bun.lock"]
      .map((sourcePath) => [
        "-v",
        `${new URL(sourcePath, projectLocalPath).pathname}:${new URL(sourcePath, actiomanSourceContainerPath).pathname}`,
      ])
      .flat(),
    // Cache
    ...["./node_modules"]
      .map((sourcePath) => [
        "-v",
        `${new URL(sourcePath, cacheProjectLocalPath).pathname}:${new URL(sourcePath, actiomanSourceContainerPath).pathname}`,
      ])
      .flat(),
    "-v",
    `${new URL("bun_cache/", cacheLocalPath).pathname}:${bunSourceContainerPath.pathname}`,
    // ----
    IMAGE_NAME,
    "sleep",
    `${CONTAINER_TIMEOUT_SECONDS}`,
  ).exited;

  const pid = new TextDecoder().decode(stdout).trim();

  await docker(
    "exec",
    "-w",
    actiomanSourceContainerPath.pathname,
    pid,
    "bun",
    "install",
  ).verbose();

  await storeContainerPID(pid);

  return pid;
};

export const killContainer = async () => {
  const pid = await getStoredContainerPID();

  if (!pid) {
    // console.log("No container found to kill.");
    return;
  }

  const { stdoutText } = await docker("stop", pid, "--timeout", "0").exited;

  const containerID = stdoutText.trim();

  if (containerID) {
    // console.log("Container killed with ID:", containerID);
    await fs.unlink(containerPidPath);
  }
};

export const prepareScript = async (
  projectName: string,
  relativePath: string,
) => {
  const containerID = await getStoredContainerPID();
  if (!containerID) {
    throw new Error("No container found to prepare script.");
  }
  const scriptLocalPath = new URL(
    relativePath,
    new URL(`./${projectName}/`, scriptsLocalPath),
  );
  const scriptContainerPath = new URL(relativePath, appSourceContainerPath);
  await fs.mkdir(new URL("./", scriptLocalPath), { recursive: true });
  if (!fsSync.existsSync(scriptLocalPath)) {
    await fs.writeFile(scriptLocalPath, ``);
    // console.log(`Script created at: ${scriptLocalPath}`);
  }
  await docker(
    "cp",
    scriptLocalPath.pathname,
    `${containerID}:${scriptContainerPath.pathname}`,
  );
  return scriptLocalPath;
};

export const initializeCliActioman = async () => {
  const pid = await getStoredContainerPID();

  if (!pid) {
    throw new Error("No container found to execute command.");
  }

  return {
    docker: (...args: string[]) =>
      docker(
        "exec",
        pid,
        "bun",
        "run",
        new URL("src/cli/actioman.ts", actiomanSourceContainerPath).pathname,
        ...args,
      ),
  };
};
