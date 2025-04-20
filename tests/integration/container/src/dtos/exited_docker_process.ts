/**
 * Represents the result of a Docker process after it has exited.
 *
 * @property {number | null} exitCode - The exit code of the process.
 * @property {Uint8Array} stdout - The raw stdout output.
 * @property {Uint8Array} stderr - The raw stderr output.
 * @property {string} stdoutText - The decoded stdout output as a string.
 * @property {string} stderrText - The decoded stderr output as a string.
 * @property {any | undefined} stdoutJson - The parsed stdout as JSON, if possible.
 * @property {any | undefined} stderrJson - The parsed stderr as JSON, if possible.
 */
export type ExitedDockerProcess = {
  exitCode: number | null;
  stdout: Uint8Array;
  stderr: Uint8Array;
  stdoutText: string;
  stderrText: string;
  stdoutJson: any | undefined;
  stderrJson: any | undefined;
};
