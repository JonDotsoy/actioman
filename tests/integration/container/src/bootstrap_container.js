import { actiomanSourceContainerPath } from "./constants/actioman_source_container_path";
import { CONTAINER_TIMEOUT_SECONDS } from "./constants/container_timeout_seconds";
import { docker } from "./docker";
import { getStoredContainerPID } from "./get_stored_container_pid";
import { logger } from "./utils/logger";
import { storeContainerPID } from "./store_container_pid";
import { DEFAULT_VERBOSE } from "./constants/default_verbose";
import { dockerRun } from "./docker_run";
import { ACTIOMAN_CONTAINER_PORTS } from "./constants/container_ports";
import { appSourceContainerPath } from "./constants/app_source_container_path";
import { IMAGE_NAME } from "./constants/image_name";
import { containerScriptsContainerPath } from "./container_scripts_container_path";
import { PROJECT_SOURCE_PATHS } from "./constants/project_source_paths";
import { projectLocalPath } from "./constants/project_local_path";
import { PROJECT_CACHE_PATHS } from "./project_cache_paths";
import { cacheProjectLocalPath } from "./constants/cache_project_local_path";
import { bunSourceContainerPath } from "./constants/bun_source_container_path";
import { cacheLocalPath } from "./constants/cache_local_path";
import { containerScriptsLocalPath } from "./container_scripts_local_path";
import { initializeContainerCliHelpers } from "./initialize_container_cli_helpers";
/**
 * Boots up and prepares a Docker container for integration testing.
 *
 * This function ensures a container is running and ready for integration tests by:
 * - Checking if a container is already running (by stored PID).
 * - If not running, starting a new container with the required configuration, mounting source and cache directories, and exposing necessary ports.
 * - Running the entrypoint script in sleep mode to keep the container alive for the specified timeout.
 * - Installing dependencies inside the container using Bun.
 * - Storing the container PID for later use and logging progress.
 *
 * Typical usage is as part of test setup to guarantee a clean, ready-to-use containerized environment.
 *
 * @param {bootstrapContainerOptions} [options] - Optional configuration for container startup:
 *   @param {boolean} [options.verbose] - Enable verbose logging (default: repository setting).
 *   @param {number} [options.timeoutSeconds] - Timeout in seconds for the container to stay alive (default: 2 hours).
 * @returns {Promise<string>} Resolves with the PID of the started (or already running) container.
 *
 * @example
 *   // In test setup:
 *   await bootstrapContainer({ verbose: true, timeoutSeconds: 600 });
 *
 * The container will be started if not already running, dependencies installed, and PID stored for later cleanup.
 */
export const bootstrapContainer = async (options = {}) => {
  const verbose = options?.verbose ?? DEFAULT_VERBOSE;
  const containerTimeoutSeconds =
    options?.timeoutSeconds ?? CONTAINER_TIMEOUT_SECONDS;
  const { info, error } = logger(options?.verbose);
  const storedPID = await getStoredContainerPID();
  if (storedPID) {
    info("Container already running with PID:", storedPID);
    return storedPID;
  }
  info("Starting the container...");
  const { stdout } = await dockerRun({
    containerTimeoutSeconds,
    publishPorts: Object.values(ACTIOMAN_CONTAINER_PORTS),
    detached: true,
    rm: true,
    workdir: appSourceContainerPath.pathname,
    volumes: {
      ...Object.fromEntries(
        PROJECT_SOURCE_PATHS.map((path) => [
          new URL(path, actiomanSourceContainerPath).pathname,
          new URL(path, projectLocalPath),
        ]),
      ),
      ...Object.fromEntries(
        PROJECT_CACHE_PATHS.map((path) => [
          new URL(path, actiomanSourceContainerPath).pathname,
          new URL(path, cacheProjectLocalPath),
        ]),
      ),
      [bunSourceContainerPath.pathname]: new URL("bun_cache/", cacheLocalPath),
      [containerScriptsContainerPath.pathname]: containerScriptsLocalPath,
    },
    command: [
      IMAGE_NAME,
      "sh",
      `${new URL("entrypoint.sh", containerScriptsContainerPath).pathname}`,
      "sleep",
      "--sleep-time",
      `${containerTimeoutSeconds}`,
    ],
  }).verbose(verbose).exited;
  const containerPid = new TextDecoder().decode(stdout).trim();
  await storeContainerPID(containerPid);
  info("Container started with PID:", containerPid);
  const { actiomanSourceContainerShell } =
    await initializeContainerCliHelpers();
  await actiomanSourceContainerShell("bun", "install").exited;
  info("Container initialized with PID:", containerPid);
  return containerPid;
};
