import { spawn } from "child_process";
import { DockerProcess } from "./docker_process";
import { Subscriber } from "./utils/subscriber";
import type { ExitedDockerProcess } from "./dtos/exited_docker_process";
import { concatUint8Array } from "./utils/concat_uint8_array";
import { invokeSafely } from "./utils/invoke_safely";
import { DEFAULT_VERBOSE } from "./constants/default_verbose";

/**
 * Spawns a Docker process and provides access to its output streams and exit status.
 *
 * @param {...string} args - Arguments to pass to the Docker CLI.
 * @returns {DockerProcess} An object for interacting with the running Docker process.
 */
export const docker = (...args: string[]): DockerProcess => {
  let verbose = { current: DEFAULT_VERBOSE };
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

  console.log(`[Docker Command]: docker ${args.join(" ")}`);
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
