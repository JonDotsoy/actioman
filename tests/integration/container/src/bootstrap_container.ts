import { actiomanSourceContainerPath } from "./constants/actioman_source_container_path";
import { appSourceContainerPath } from "./constants/app_source_container_path";
import type { bootstrapContainerOptions } from "./dtos/bootstrap_container_options";
import { bunSourceContainerPath } from "./constants/bun_source_container_path";
import { cacheLocalPath } from "./constants/cache_local_path";
import { cacheProjectLocalPath } from "./constants/cache_project_local_path";
import { CONTAINER_TIMEOUT_SECONDS } from "./constants/container_timeout_seconds";
import { containerScriptsContainerPath } from "./container_scripts_container_path";
import { containerScriptsLocalPath } from "./container_scripts_local_path";
import { docker } from "./docker";
import { getStoredContainerPID } from "./get_stored_container_pid";
import { IMAGE_NAME } from "./constants/image_name";
import { projectLocalPath } from "./constants/project_local_path";
import { logger } from "./utils/logger";
import { storeContainerPID } from "./store_container_pid";
import { PROJECT_SOURCE_PATHS } from "./constants/project_source_paths";
import { PROJECT_CACHE_PATHS } from "./project_cache_paths";

/**
 * Boots up a Docker container for integration testing, installs dependencies, and stores its PID.
 *
 * - Starts the container if not already running.
 * - Installs dependencies inside the container.
 * - Stores the container PID for later use.
 *
 * @param {bootstrapContainerOptions} [options] - Options for container startup and verbosity.
 * @returns {Promise<string>} The PID of the started container.
 */
export const bootstrapContainer = async (
  options?: bootstrapContainerOptions,
) => {
  const { info, error } = logger(options?.verbose);
  const storedPID = await getStoredContainerPID();

  if (storedPID) {
    info("Container already running with PID:", storedPID);
    return storedPID;
  }

  info("Starting the container...");

  /**
   * An array of strings representing the arguments to be passed to the Docker command.
   * This can be used to customize the behavior of Docker containers during execution.
   */
  const dockerArgs: string[] = [];

  /*
   * Docker arguments for container ports
   */
  for (const port of Object.values(CONTAINER_TIMEOUT_SECONDS)) {
    dockerArgs.push("-p", `${port}:${port}`);
  }

  for (const sourcePath of PROJECT_SOURCE_PATHS) {
    dockerArgs.push(
      "-v",
      `${new URL(sourcePath, projectLocalPath).pathname}:${new URL(sourcePath, actiomanSourceContainerPath).pathname}`,
    );
  }

  for (const cachePath of PROJECT_CACHE_PATHS) {
    dockerArgs.push(
      "-v",
      `${new URL(cachePath, cacheProjectLocalPath).pathname}:${new URL(cachePath, actiomanSourceContainerPath).pathname}`,
    );
  }

  dockerArgs.push(
    "-v",
    `${new URL("bun_cache/", cacheLocalPath).pathname}:${bunSourceContainerPath.pathname}`,
  );

  dockerArgs.push(
    "-v",
    `${containerScriptsLocalPath.pathname}:${containerScriptsContainerPath.pathname}`,
  );

  const { stdout } = await docker(
    "run",
    "--network",
    "host",
    "-d", // run in detached mode
    "--rm", // remove the container when it exits

    "--workdir",
    appSourceContainerPath.pathname,

    ...dockerArgs,

    // ----
    IMAGE_NAME,
    "sh",
    `${new URL("entrypoint.sh", containerScriptsContainerPath).pathname}`,
    "sleep",
    "--sleep-time",
    `${CONTAINER_TIMEOUT_SECONDS}`,
  ).verbose(options?.verbose).exited;

  const containerPid = new TextDecoder().decode(stdout).trim();

  info("Container started with PID:", containerPid);

  // Install dependencies inside the container
  await docker(
    "exec",
    "-w",
    actiomanSourceContainerPath.pathname,
    containerPid,
    "bun",
    "install",
  ).verbose(options?.verbose).exited;

  info("Container initialized with PID:", containerPid);

  await storeContainerPID(containerPid);

  return containerPid;
};
