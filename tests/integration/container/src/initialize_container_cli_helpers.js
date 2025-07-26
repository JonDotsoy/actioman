import { actiomanSourceContainerPath } from "./constants/actioman_source_container_path";
import { appSourceContainerPath } from "./constants/app_source_container_path";
import { containerScriptsContainerPath } from "./container_scripts_container_path";
import { docker } from "./docker";
import { getStoredContainerPID } from "./get_stored_container_pid";
import { prepareSnapFile } from "./prepare_script";
/**
 * Initializes helpers for interacting with the Actioman CLI and related scripts inside a Docker container.
 *
 * Provides utilities to execute commands, scripts, and manage the Actioman environment within the container. The returned object includes:
 *
 * - `pid`: The Docker container process ID.
 * - `shell`: Execute a command inside the container.
 * - `shellWithOptions`: Execute a command with additional options (e.g., workspace path).
 * - `entrypoint`: Run a script using the container's entrypoint.
 * - `exec`: Run an exec command via entrypoint (for Actioman CLI commands).
 * - `killExec`: Run a kill-exec command via entrypoint (to terminate processes).
 * - `actioman`: Run the Actioman CLI inside the container using Bun.
 * - `clearAppSource`: Remove the application source code from the container.
 * - `actiomanSourceContainerShell`: Execute a command in the Actioman source workspace inside the container.
 *
 * @param {initializeCliActiomanOptions} [options] - Optional initialization options for the CLI helpers.
 * @returns {Promise<DockerCommandInterface>} An object containing CLI helpers and the container PID.
 *
 * @example
 * const cli = await initializeContainerCliHelpers();
 * await cli.actioman("--help");
 * await cli.shell("ls", "/");
 * await cli.clearAppSource();
 */
export const initializeContainerCliHelpers = async (options) => {
  const defaultWorkspace = options?.workspace
    ? new URL(`${options.workspace}/`, appSourceContainerPath)
    : appSourceContainerPath;
  const containerPID = await getStoredContainerPID();
  if (!containerPID) {
    throw new Error("No container found to execute command.");
  }
  await docker("exec", containerPID, "mkdir", "-p", defaultWorkspace.pathname);
  /**
   * Executes a command inside the Docker container with additional options.
   * @param {ShellOptions} options - Options such as workspace path.
   * @param {...string} args - Command and arguments to execute.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const shellWithOptions = (options, ...args) => {
    const dockerArgs = [];
    const workspace = options.workspace ?? defaultWorkspace.pathname;
    dockerArgs.push("-w", workspace);
    return docker("exec", ...dockerArgs, containerPID, ...args);
  };
  /**
   * Executes a command inside the Docker container.
   * @param {...string} args - Command and arguments to execute.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const shell = (...args) => shellWithOptions({}, ...args);
  /**
   * Runs a script using the container's entrypoint.
   * @param {...string} args - Arguments for the entrypoint script.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const entrypoint = (...args) =>
    shell(
      "sh",
      `${new URL("entrypoint.sh", containerScriptsContainerPath).pathname}`,
      ...args,
    );
  /**
   * Executes a command in the Actioman source workspace inside the container.
   * @param {...string} args - Command and arguments to execute.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const actiomanSourceContainerShell = (...args) =>
    shellWithOptions(
      {
        workspace: actiomanSourceContainerPath.pathname,
      },
      ...args,
    );
  /**
   * Runs the 'exec' command using the entrypoint script.
   * @param {...string} args - Arguments for the 'exec' command.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const exec = (...args) => entrypoint("exec", ...args);
  /**
   * Runs the 'kill-exec' command using the entrypoint script.
   * @param {...string} args - Arguments for the 'kill-exec' command.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const killExec = (...args) => entrypoint("kill-exec", ...args);
  /**
   * Executes the Actioman CLI inside the container using Bun.
   * @param {...string} args - Arguments for the Actioman CLI.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const actioman = (...args) =>
    exec(
      "bun",
      "run",
      new URL("src/cli/actioman.ts", actiomanSourceContainerPath).pathname,
      ...args,
    );
  /**
   * Removes the application source code from the container.
   * @param {...string} args - Arguments for clearing the source code.
   * @returns {ReturnType<typeof docker>} Result of the execution.
   */
  const clearAppSource = (...args) => entrypoint("clear-app-source", ...args);
  const prepareFile = async (projectName, relativePath) => {
    const localPath = await prepareSnapFile(`${projectName}/${relativePath}`);
    const containerPath = new URL(relativePath, defaultWorkspace);
    await docker(
      "exec",
      containerPID,
      "mkdir",
      "-p",
      new URL("./", containerPath).pathname,
    ).exited;
    await docker(
      "cp",
      localPath.pathname,
      `${containerPID}:${containerPath.pathname}`,
    ).exited;
  };
  return {
    pid: containerPID,
    shell,
    shellWithOptions,
    actioman,
    entrypoint,
    exec,
    killExec,
    clearAppSource,
    actiomanSourceContainerShell,
    prepareFile,
  };
};
