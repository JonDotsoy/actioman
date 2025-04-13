import { spawn } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";

const containerPidPath = new URL(".container_pid", import.meta.url);
const projectLocalPath = new URL("../../", import.meta.url);
const cacheLocalPath = new URL(".cache/", import.meta.url);
const cacheProjectLocalPath = new URL("project/", cacheLocalPath);
const scriptsLocalPath = new URL("scripts/", import.meta.url);
const containerScriptsLocalPath = new URL(
  "./container_scripts/",
  import.meta.url,
);
const containerScriptsContainerPath = new URL(
  "file:///root/container_scripts/",
);
const actiomanSourceContainerPath = new URL("file:///usr/share/actioman/");
const bunSourceContainerPath = new URL("file:///root/.bun/");
const appSourceContainerPath = new URL("file:///app/");

await fs.mkdir(cacheLocalPath, { recursive: true });
await fs.mkdir(cacheProjectLocalPath, { recursive: true });
await fs.mkdir(scriptsLocalPath, { recursive: true });

const IMAGE_NAME = "oven/bun:latest";
const CONTAINER_TIMEOUT_SECONDS = /* 10 minutes */ 10 * 60;

const logger = (enable: boolean = true) => {
  return {
    info: (...args: any[]) => {
      if (!enable) return;
      console.log(...args);
    },
    error: (...args: any[]) => {
      if (!enable) return;
      console.error(...args);
    },
  };
};

const invokeSafely = <T>(cb: () => Promise<T>) => {
  try {
    return cb();
  } catch (error) {
    return undefined;
  }
};

invokeSafely.sync = <T>(cb: () => T) => {
  try {
    return cb();
  } catch (error) {
    return undefined;
  }
};

class Subscriber<T> {
  subscribers: ((value: T) => void)[] = [];
  subscribe(callback: (value: T) => void) {
    this.subscribers.push(callback);
    return () => {
      this.unsubscribe(callback);
    };
  }
  unsubscribe(callback: (value: T) => void) {
    this.subscribers = this.subscribers.filter((cb) => cb !== callback);
  }
  notify(value: T) {
    for (const callback of this.subscribers) {
      callback(value);
    }
  }
}

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
  stdoutJson: any | undefined;
  stderrJson: any | undefined;
};

class DockerProcess {
  constructor(
    public readonly stdout: ReadableStream<Uint8Array>,
    public readonly stderr: ReadableStream<Uint8Array>,
    public readonly stdoutSubscriber: Subscriber<Uint8Array>,
    public readonly stderrSubscriber: Subscriber<Uint8Array>,
    public readonly exited: Promise<ExitedDockerProcess>,
    private readonly verboseStatus: { current: boolean },
  ) {}

  async waitForLog(match: string, timeout: number = 60_000): Promise<this> {
    await new Promise<any>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        stdoutUnsubscriber();
        reject(new Error(`Timeout waiting for log: ${match}`));
      }, timeout);
      const stdoutUnsubscriber = this.stdoutSubscriber.subscribe((data) => {
        const text = new TextDecoder().decode(data);
        if (text.includes(match)) {
          resolve(true);
          clearTimeout(timeoutId);
          stdoutUnsubscriber();
        }
      });
    });
    return this;
  }

  verbose(verbose: boolean = true): this {
    this.verboseStatus.current = verbose;
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
  const stdoutSubscriber = new Subscriber<Uint8Array>();
  const stderrSubscriber = new Subscriber<Uint8Array>();

  // console.log(`[Docker Command]: docker ${args.join(" ")}`);
  const childProcess = spawn("docker", args, {
    stdio: "pipe",
    shell: true,
  });

  childProcess.stdout?.on("data", (data: Uint8Array) => {
    if (verbose.current) process.stdout.write(data);
    stdoutReadableController?.enqueue(data);
    stdoutBuffer.push(data);
    stdoutSubscriber.notify(data);
  });

  childProcess.stderr?.on("data", (data: Uint8Array) => {
    if (verbose.current) process.stderr.write(data);
    stderrReadableController?.enqueue(data);
    stderrBuffer.push(data);
    stderrSubscriber.notify(data);
  });

  const exited = new Promise<ExitedDockerProcess>((resolve, reject) => {
    childProcess.on("error", (error) => {
      stderrReadableController?.close();
      stdoutReadableController?.close();
      reject(error);
    });

    childProcess.on("close", (code) => {
      stderrReadableController?.close();
      stdoutReadableController?.close();
      return resolve({
        exitCode: code,
        stdout: concatUint8Array(stdoutBuffer),
        stderr: concatUint8Array(stderrBuffer),
        stdoutText: new TextDecoder().decode(concatUint8Array(stdoutBuffer)),
        stderrText: new TextDecoder().decode(concatUint8Array(stderrBuffer)),
        stdoutJson: invokeSafely.sync(() =>
          JSON.parse(new TextDecoder().decode(concatUint8Array(stdoutBuffer))),
        ),
        stderrJson: invokeSafely.sync(() =>
          JSON.parse(new TextDecoder().decode(concatUint8Array(stderrBuffer))),
        ),
      });
    });
  });

  return new DockerProcess(
    stdoutReadable,
    stderrReadable,
    stdoutSubscriber,
    stderrSubscriber,
    exited,
    verbose,
  );
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

type bootstrapContainerOptions = {
  verbose?: boolean;
};

export const bootstrapContainer = async (
  options?: bootstrapContainerOptions,
) => {
  const { info, error } = logger(options?.verbose);
  const storedPID = await getStoredContainerPID();

  if (storedPID) {
    info("Container already running with PID:", storedPID);
    return storedPID;
  }

  info("Starting the container...");

  const { stdout } = await docker(
    "run",
    "--network",
    "host",
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
    "-v",
    `${containerScriptsLocalPath.pathname}:${containerScriptsContainerPath.pathname}`,
    // ----
    IMAGE_NAME,
    // "sleep",
    "sh",
    `${new URL("bootstrap.sh", containerScriptsContainerPath).pathname}`,
    `${CONTAINER_TIMEOUT_SECONDS}`,
  ).verbose(options?.verbose).exited;

  const pid = new TextDecoder().decode(stdout).trim();

  info("Container started with PID:", pid);

  await docker(
    "exec",
    "-w",
    actiomanSourceContainerPath.pathname,
    pid,
    "bun",
    "install",
  ).verbose(options?.verbose).exited;

  info("Container initialized with PID:", pid);

  await storeContainerPID(pid);

  return pid;
};

type killContainerOptions = {
  verbose?: boolean;
};

export const killContainer = async (options?: killContainerOptions) => {
  const { info, error } = logger(options?.verbose);
  const pid = await getStoredContainerPID();

  if (!pid) {
    info("No container found to kill.");
    return;
  }

  info("Killing the container with PID:", pid);
  await docker(
    "exec",
    pid,
    "sh",
    `${new URL("kill.sh", containerScriptsContainerPath).pathname}`,
  ).exited;

  // get container status
  const { stdout } = await docker(
    "inspect",
    pid,
    "--format",
    "{{.State.Status}}",
  ).exited;
  const stateStatus = new TextDecoder().decode(stdout).trim();
  if (stateStatus !== "running") {
    info("Container already stopped with PID:", pid);
    await fs.unlink(containerPidPath);
    return;
  }

  info("Killing the container with PID:", pid);
  const { stdoutText } = await docker("stop", pid, "--timeout", "0").exited;

  const containerID = stdoutText.trim();

  if (containerID) {
    info("Killing the container with PID:", pid); // console.log("Container killed with ID:", containerID);
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

  const shell = (...args: string[]) => docker("exec", pid, ...args);

  const actioman = (...args: string[]) =>
    docker(
      "exec",
      pid,
      "bun",
      "run",
      new URL("src/cli/actioman.ts", actiomanSourceContainerPath).pathname,
      ...args,
    );

  return {
    pid,
    shell,
    actioman,
  };
};
