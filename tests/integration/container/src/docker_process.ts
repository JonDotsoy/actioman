import type { ExitedDockerProcess } from "./dtos/exited_docker_process";
import type { Subscriber } from "./utils/subscriber";

/**
 * Represents a running Docker process, providing access to its output streams and control methods.
 *
 * @class
 * @property {ReadableStream<Uint8Array>} stdout - Stream of stdout data.
 * @property {ReadableStream<Uint8Array>} stderr - Stream of stderr data.
 * @property {Subscriber<Uint8Array>} stdoutSubscriber - Subscriber for stdout events.
 * @property {Subscriber<Uint8Array>} stderrSubscriber - Subscriber for stderr events.
 * @property {Promise<ExitedDockerProcess>} exited - Resolves when the process exits.
 *
 * @method waitForLog Waits for a specific log message in stdout.
 * @method verbose Enables or disables verbose output.
 */
export class DockerProcess {
  constructor(
    public readonly stdout: ReadableStream<Uint8Array>,
    public readonly stderr: ReadableStream<Uint8Array>,
    public readonly stdoutSubscriber: Subscriber<Uint8Array>,
    public readonly stderrSubscriber: Subscriber<Uint8Array>,
    public readonly exited: Promise<ExitedDockerProcess>,
    private readonly verboseStatus: { current: boolean },
  ) {}

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

  verbose(verbose: boolean = true): this {
    this.verboseStatus.current = verbose;
    return this;
  }
}
