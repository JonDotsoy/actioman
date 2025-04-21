import { actiomanSourceContainerPath } from "./constants/actioman_source_container_path";
import { containerScriptsContainerPath } from "./container_scripts_container_path";
import { docker } from "./docker";
import { getStoredContainerPID } from "./get_stored_container_pid";
import type { initializeCliActiomanOptions } from "./initialize_cli_actioman_options";

type ShellOptions = {
  workspace?: string;
};

/**
 * Initializes CLI helpers for interacting with the Actioman process inside a Docker container.
 *
 * Returns an object with utilities to run commands in the container:
 * - `pid`: The container process ID.
 * - `shell`: Run a command in the container.
 * - `shellWithOptions`: Run a command with options (e.g., workspace).
 * - `entrypoint`: Run a script via the container's entrypoint.
 * - `exec`: Run an exec command via entrypoint (for Actioman CLI commands).
 * - `killExec`: Run a kill-exec command via entrypoint (to terminate processes).
 * - `actioman`: Run the Actioman CLI inside the container (using Bun runner).
 * - `clearAppSource`: Clear the app source in the container (removes app code).
 * - `actiomanSourceContainerShell`: Run a command in the Actioman source workspace inside the container.
 *
 * @param {initializeCliActiomanOptions} [options] - Optional initialization options for the CLI helpers.
 * @returns {Promise<{
 *   pid: string,
 *   shell: (...args: string[]) => ReturnType<typeof docker>,
 *   shellWithOptions: (options: ShellOptions, ...args: string[]) => ReturnType<typeof docker>,
 *   actioman: (...args: string[]) => ReturnType<typeof docker>,
 *   entrypoint: (...args: string[]) => ReturnType<typeof docker>,
 *   exec: (...args: string[]) => ReturnType<typeof docker>,
 *   killExec: (...args: string[]) => ReturnType<typeof docker>,
 *   clearAppSource: (...args: string[]) => ReturnType<typeof docker>,
 *   actiomanSourceContainerShell: (...args: string[]) => ReturnType<typeof docker>,
 * }>} CLI helpers and container PID.
 *
 * @example
 * const cli = await initializeActiomanCli();
 * await cli.actioman("--help");
 * await cli.shell("ls", "/");
 * await cli.clearAppSource();
 */
export const initializeActiomanCli = async (
  options?: initializeCliActiomanOptions,
) => {
  const pid = await getStoredContainerPID();

  if (!pid) {
    throw new Error("No container found to execute command.");
  }

  /**
   * Runs a command in the Docker container with additional options.
   * @param {ShellOptions} options - Options such as workspace.
   * @param {...string} args - Command and arguments to execute.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const shellWithOptions = (options: ShellOptions, ...args: string[]) => {
    const dockerArgs: string[] = [];

    if (options.workspace) {
      dockerArgs.push("-w", options.workspace);
    }

    return docker("exec", ...dockerArgs, pid, ...args);
  };

  /**
   * Runs a command in the Docker container.
   * @param {...string} args - Command and arguments to execute.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const shell = (...args: string[]) => shellWithOptions({}, ...args);

  /**
   * Runs a script using the container's entrypoint.
   * @param {...string} args - Arguments for the entrypoint.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const entrypoint = (...args: string[]) =>
    shell(
      "sh",
      `${new URL("entrypoint.sh", containerScriptsContainerPath).pathname}`,
      ...args,
    );

  /**
   * Runs a command in the Actioman source workspace inside the container.
   * @param {...string} args - Command and arguments to execute.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const actiomanSourceContainerShell = (...args: string[]) =>
    shellWithOptions(
      {
        workspace: actiomanSourceContainerPath.pathname,
      },
      ...args,
    );

  /**
   * Runs the 'exec' command using the entrypoint.
   * @param {...string} args - Arguments for 'exec'.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const exec = (...args: string[]) => entrypoint("exec", ...args);

  /**
   * Runs the 'kill-exec' command using the entrypoint.
   * @param {...string} args - Arguments for 'kill-exec'.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const killExec = (...args: string[]) => entrypoint("kill-exec", ...args);

  /**
   * Runs the Actioman CLI inside the container.
   * @param {...string} args - Arguments for the Actioman CLI.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const actioman = (...args: string[]) =>
    exec(
      "bun",
      "run",
      new URL("src/cli/actioman.ts", actiomanSourceContainerPath).pathname,
      ...args,
    );

  /**
   * Clears the app source code inside the container.
   * @param {...string} args - Arguments to clear the source code.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const clearAppSource = (...args: string[]) =>
    entrypoint("clear-app-source", ...args);

  return {
    pid,
    shell,
    shellWithOptions,
    actioman,
    entrypoint,
    exec,
    killExec,
    clearAppSource,
    actiomanSourceContainerShell,
  };
};
