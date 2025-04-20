import fsSync from "fs";
import fs from "fs/promises";
import { docker } from "./docker";
import { containerPidPath } from "./constants/container_pid_path";

/**
 * Retrieves the PID of a running Docker container from disk, verifying it is still running.
 *
 * @returns {Promise<string | null>} The PID if the container is running, or null otherwise.
 */
export const getStoredContainerPID = async () => {
  if (fsSync.existsSync(containerPidPath)) {
    const pidPayload = await fs.readFile(containerPidPath, "utf-8");
    const pid = pidPayload.trim();
    if (pid) {
      try {
        const { stdout } = await docker(
          "inspect",
          pid,
          "--format",
          "{{.State.Status}}",
        ).exited;
        const stateStatus = new TextDecoder().decode(stdout).trim();
        if (stateStatus === "running") {
          return pid;
        }
      } catch (error) {
        return null;
      }
    }
  }
  return null;
};
