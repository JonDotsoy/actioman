import { spawn } from "child_process";
import { DockerProcess } from "./docker_process";
import { Subscriber } from "./utils/subscriber";
import { concatUint8Array } from "./utils/concat_uint8_array";
import { invokeSafely } from "./utils/invoke_safely";
import { DEFAULT_VERBOSE } from "./constants/default_verbose";
import { logger } from "./utils/logger";
import { atom } from "./utils/atom";
/**
 * Spawns a Docker process and provides access to its output streams and exit status.
 *
 * @param {...string} args - Arguments to pass to the Docker CLI.
 * @returns {DockerProcess} An object for interacting with the running Docker process.
 */
export const docker = (...args) => {
  /**
   * Represents a reactive state for controlling verbosity in the application.
   * The `verbose` atom is initialized with a default value and can be used
   * to toggle or check the verbosity level dynamically.
   *
   * @constant
   */
  const verbose = atom(DEFAULT_VERBOSE);
  /**
   * A state atom that holds a boolean value indicating whether exceptions
   * should be suppressed (`true`) or not (`false`).
   *
   * @remarks
   * This atom is likely used to control error-handling behavior in the application.
   *
   * @defaultValue `false`
   */
  const nothrow = atom(false);
  const { error, info } = logger(verbose);
  const stdoutBuffer = [];
  const stderrBuffer = [];
  let stdoutReadableController = null;
  let stderrReadableController = null;
  const stdoutReadable = new ReadableStream({
    start: (c) => (stdoutReadableController = c),
  });
  const stderrReadable = new ReadableStream({
    start: (c) => (stderrReadableController = c),
  });
  const stdoutSubscriber = new Subscriber();
  const stderrSubscriber = new Subscriber();
  const dockerCommand = `docker ${args.join(" ")}`;
  info(`[Docker Command]: ${dockerCommand}`);
  const childProcess = spawn("docker", args, {
    stdio: "pipe",
    shell: true,
  });
  childProcess.stdout?.on("data", (data) => {
    if (verbose.get()) process.stdout.write(data);
    stdoutReadableController?.enqueue(data);
    stdoutBuffer.push(data);
    stdoutSubscriber.notify(data);
  });
  childProcess.stderr?.on("data", (data) => {
    if (verbose.get()) process.stderr.write(data);
    stderrReadableController?.enqueue(data);
    stderrBuffer.push(data);
    stderrSubscriber.notify(data);
  });
  const closeProcess = new Promise((resolve, reject) => {
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
  const exited = closeProcess
    .then((exited) => {
      info(`Exited with code: ${exited.exitCode}`);
      if (exited.exitCode === 0) return exited;
      if (nothrow.get()) {
        info(
          `Docker command ${dockerCommand} exited with code ${exited.exitCode}`,
        );
        return exited;
      }
      if (exited.exitCode === 137) {
        info(`Docker command ${dockerCommand} was killed`);
        return exited;
      }
      throw new Error(
        `[Docker Error] ${dockerCommand} exited with code ${exited.exitCode}: ${exited.stderrText}`,
      );
    })
    .catch((err) => {
      error(`Error: ${err}`);
      throw err;
    });
  return new DockerProcess(
    stdoutReadable,
    stderrReadable,
    stdoutSubscriber,
    stderrSubscriber,
    exited,
    verbose,
    nothrow,
  );
};
