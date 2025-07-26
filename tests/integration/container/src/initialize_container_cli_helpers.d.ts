import { docker } from "./docker";
import type { initializeCliActiomanOptions } from "./initialize_cli_actioman_options";
/**
 * Represents a set of commands and utilities for interacting with Docker containers.
 */
type DockerCommandInterface = {
  /**
   * The process ID of the Docker container.
   */
  pid: string;
  /**
   * Executes a Docker shell command.
   * @param args - The arguments to pass to the Docker shell command.
   * @returns The result of the Docker command execution.
   */
  shell: (...args: string[]) => ReturnType<typeof docker>;
  /**
   * Executes a Docker shell command with additional options.
   * @param options - Configuration options for the command, such as the workspace.
   * @param args - The arguments to pass to the Docker shell command.
   * @returns The result of the Docker command execution.
   */
  shellWithOptions: (
    options: {
      workspace?: string;
    },
    ...args: string[]
  ) => ReturnType<typeof docker>;
  /**
   * Executes an Actioman-specific Docker command.
   * @param args - The arguments to pass to the Actioman Docker command.
   * @returns The result of the Docker command execution.
   */
  actioman: (...args: string[]) => ReturnType<typeof docker>;
  /**
   * Executes a Docker command targeting the container's entrypoint.
   * @param args - The arguments to pass to the entrypoint command.
   * @returns The result of the Docker command execution.
   */
  entrypoint: (...args: string[]) => ReturnType<typeof docker>;
  /**
   * Executes a command inside the Docker container.
   * @param args - The arguments to pass to the exec command.
   * @returns The result of the Docker command execution.
   */
  exec: (...args: string[]) => ReturnType<typeof docker>;
  /**
   * Terminates a previously executed command inside the Docker container.
   * @param args - The arguments to pass to the kill command.
   * @returns The result of the Docker command execution.
   */
  killExec: (...args: string[]) => ReturnType<typeof docker>;
  /**
   * Clears the application source code inside the Docker container.
   * @param args - The arguments to pass to the clear command.
   * @returns The result of the Docker command execution.
   */
  clearAppSource: (...args: string[]) => ReturnType<typeof docker>;
  /**
   * Executes a shell command in the source container for Actioman.
   * @param args - The arguments to pass to the shell command.
   * @returns The result of the Docker command execution.
   */
  actiomanSourceContainerShell: (
    ...args: string[]
  ) => ReturnType<typeof docker>;
  /**
   * Prepares a file in the specified project and relative path.
   * @param projectName - The name of the project.
   * @param relativePath - The relative path to the file within the project.
   * @returns A promise that resolves when the file preparation is complete.
   */
  prepareFile: (projectName: string, relativePath: string) => Promise<void>;
};
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
export declare const initializeContainerCliHelpers: (
  options?: initializeCliActiomanOptions,
) => Promise<DockerCommandInterface>;
export {};
