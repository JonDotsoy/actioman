import { actiomanSourceContainerPath } from "./constants/actioman_source_container_path";
import { containerScriptsContainerPath } from "./container_scripts_container_path";
import { docker } from "./docker";
import { getStoredContainerPID } from "./get_stored_container_pid";
/**
 * Initializes CLI commands for interacting with the Actioman process inside a Docker container.
 *
 * Provides helpers for running shell, entrypoint, exec, killExec, and actioman commands in the container.
 *
 * @param {initializeCliActiomanOptions} [options] - Optional initialization options.
 * @returns {Promise<{ pid: string, shell: Function, actioman: Function, entrypoint: Function, exec: Function, killExec: Function }>} CLI helpers and container PID.
 */
export const initializeActiomanCli = async (options) => {
  const pid = await getStoredContainerPID();
  if (!pid) {
    throw new Error("No container found to execute command.");
  }
  const shell = (...args) => docker("exec", pid, ...args);
  const entrypoint = (...args) =>
    docker(
      "exec",
      pid,
      "sh",
      `${new URL("entrypoint.sh", containerScriptsContainerPath).pathname}`,
      ...args,
    );
  const exec = (...args) => entrypoint("exec", ...args);
  const killExec = (...args) => entrypoint("kill-exec", ...args);
  const actioman = (...args) =>
    exec(
      "bun",
      "run",
      new URL("src/cli/actioman.ts", actiomanSourceContainerPath).pathname,
      ...args,
    );
  return {
    pid,
    shell,
    actioman,
    entrypoint,
    exec,
    killExec,
  };
};
