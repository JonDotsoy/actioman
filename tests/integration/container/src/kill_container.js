import fs from "fs/promises";
import { docker } from "./docker";
import { logger } from "./utils/logger";
import { getStoredContainerPID } from "./get_stored_container_pid";
import { containerScriptsContainerPath } from "./container_scripts_container_path";
import { containerPidPath } from "./constants/container_pid_path";
/**
 * Stops and removes a running Docker container used for integration tests.
 *
 * - Attempts to kill the container using a kill script.
 * - Verifies the container is stopped and removes the PID file.
 * - Throws an error if the container could not be stopped.
 *
 * @param {killContainerOptions} [options] - Options for verbosity and behavior.
 * @returns {Promise<void>} Resolves when the container is stopped and cleaned up.
 */
export const killContainer = async (options) => {
  const { info, error } = logger(options?.verbose);
  const pid = await getStoredContainerPID();
  if (!pid) {
    info("No container found to kill.");
    return;
  }
  info("Killing the container with PID:", pid, "(by killContainer)");
  await docker(
    "exec",
    pid,
    "sh",
    `${new URL("kill.sh", containerScriptsContainerPath).pathname}`,
  ).exited;
  // get container status
  const { stdout } = await docker(
    "inspect",
    pid,
    "--format",
    "{{.State.Status}}",
  ).exited;
  const stateStatus = new TextDecoder().decode(stdout).trim();
  if (stateStatus !== "running") {
    info("Container already stopped with PID:", pid);
    await fs.unlink(containerPidPath);
    return;
  }
  info("Killing the container with PID:", pid);
  const { stdoutText } = await docker("stop", pid, "--timeout", "0").exited;
  const containerID = stdoutText.trim();
  // verification stopped
  const { stdout: verifyStdout } = await docker(
    "inspect",
    containerID,
    "--format",
    "{{.State.Status}}",
  ).exited;
  const verifyStateStatus = new TextDecoder().decode(verifyStdout).trim();
  if (verifyStateStatus !== "exited") {
    error("Container not stopped with PID:", pid);
    throw new Error("Container not stopped");
  }
  if (containerID) {
    info("Killing the container with PID:", pid); // console.log("Container killed with ID:", containerID);
    await fs.unlink(containerPidPath);
  }
};
