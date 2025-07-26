import type { initializeCliActiomanOptions } from "./initialize_cli_actioman_options";
/**
 * Initializes CLI commands for interacting with the Actioman process inside a Docker container.
 *
 * Provides helpers for running shell, entrypoint, exec, killExec, and actioman commands in the container.
 *
 * @param {initializeCliActiomanOptions} [options] - Optional initialization options.
 * @returns {Promise<{ pid: string, shell: Function, actioman: Function, entrypoint: Function, exec: Function, killExec: Function }>} CLI helpers and container PID.
 */
export declare const initializeActiomanCli: (
  options?: initializeCliActiomanOptions,
) => Promise<{
  pid: string;
  shell: (...args: string[]) => import("./docker_process").DockerProcess;
  actioman: (...args: string[]) => import("./docker_process").DockerProcess;
  entrypoint: (...args: string[]) => import("./docker_process").DockerProcess;
  exec: (...args: string[]) => import("./docker_process").DockerProcess;
  killExec: (...args: string[]) => import("./docker_process").DockerProcess;
}>;
