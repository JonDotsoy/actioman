import type { ExitedDockerProcess } from "./dtos/exited_docker_process";
import type { Atom } from "./utils/atom";
import type { Subscriber } from "./utils/subscriber";

/**
 * DockerProcess
 * Represents a running Docker process, providing access to its output streams, event subscribers, and control methods.
 *
 * @class
 * @property {ReadableStream<Uint8Array>} stdout - Stream of standard output (stdout) data from the Docker process.
 * @property {ReadableStream<Uint8Array>} stderr - Stream of standard error (stderr) data from the Docker process.
 * @property {Subscriber<Uint8Array>} stdoutSubscriber - Subscriber for receiving stdout events as Uint8Array chunks.
 * @property {Subscriber<Uint8Array>} stderrSubscriber - Subscriber for receiving stderr events as Uint8Array chunks.
 * @property {Promise<ExitedDockerProcess>} exited - Promise that resolves with exit information when the process terminates.
 *
 * @constructor
 * @param {ReadableStream<Uint8Array>} stdout - The stdout stream.
 * @param {ReadableStream<Uint8Array>} stderr - The stderr stream.
 * @param {Subscriber<Uint8Array>} stdoutSubscriber - Subscriber for stdout events.
 * @param {Subscriber<Uint8Array>} stderrSubscriber - Subscriber for stderr events.
 * @param {Promise<ExitedDockerProcess>} exited - Promise resolving when the process exits.
 * @param {Atom<boolean>} verboseStatus - Atom controlling the verbosity state.
 *
 * @method waitForLog Waits for a specific log message to appear in stdout. Resolves with the DockerProcess instance or rejects on timeout.
 *   @param {string} match - The log message or substring to wait for.
 *   @param {number} [timeout=60000] - Maximum time to wait in milliseconds (default: 60 seconds).
 *   @returns {Promise<this>} Resolves with the DockerProcess instance if the log is found.
 *
 * @method verbose Enables or disables verbose output for the Docker process.
 *   @param {boolean} [verbose=true] - Whether to enable (true) or disable (false) verbose output.
 *   @returns {this} The DockerProcess instance for chaining.
 */
export class DockerProcess {
  constructor(
    public readonly stdout: ReadableStream<Uint8Array>,
    public readonly stderr: ReadableStream<Uint8Array>,
    public readonly stdoutSubscriber: Subscriber<Uint8Array>,
    public readonly stderrSubscriber: Subscriber<Uint8Array>,
    public readonly exited: Promise<ExitedDockerProcess>,
    private readonly verboseState: Atom<boolean>,
    private readonly nothrowState: Atom<boolean>,
  ) {}

  /**
   * Waits for a specific log message to appear in the container's stdout.
   *
   * This method subscribes to the container's stdout stream and resolves
   * when a log message containing the specified `match` string is detected.
   * If the log message does not appear within the specified `timeout` period,
   * the promise is rejected with a timeout error.
   *
   * @param match - The string to search for in the log messages.
   * @param timeout - The maximum time to wait for the log message, in milliseconds.
   *                   Defaults to 60,000 ms (1 minute).
   * @returns A promise that resolves with the current instance (`this`) when the log message is found.
   * @throws An error if the log message is not found within the timeout period.
   */
  async waitForLog(match: string, timeout: number = 60000): Promise<this> {
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

  /**
   * Sets the verbosity state for the current instance.
   *
   * @param verbose - A boolean value indicating whether verbose mode should be enabled (default is `true`).
   * @returns The current instance for method chaining.
   */
  verbose(verbose: boolean = true): this {
    this.verboseState.set(verbose);
    return this;
  }

  /**
   * Sets the `nothrow` state for the current instance.
   *
   * @param nothrow - A boolean value indicating whether to enable or disable the "no-throw" behavior.
   *                  Defaults to `true`.
   * @returns The current instance for method chaining.
   */
  nothrow(nothrow: boolean = true): this {
    this.nothrowState.set(nothrow);
    return this;
  }
}
