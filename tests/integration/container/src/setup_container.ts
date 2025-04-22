import fs from "fs/promises";
import { cacheLocalPath } from "./constants/cache_local_path";
import { cacheProjectLocalPath } from "./constants/cache_project_local_path";
import { scriptsLocalPath } from "./constants/scripts_local_path";
import { bootstrapContainer } from "./bootstrap_container";
import { initializeContainerCliHelpers } from "./initialize_container_cli_helpers";

/**
 * Sets up the container environment by creating necessary directories,
 * bootstrapping the container, and initializing CLI helpers.
 *
 * This function performs the following steps:
 * 1. Creates the required local directories for caching and scripts.
 * 2. Bootstraps the container environment.
 * 3. Initializes container CLI helpers and clears the application source.
 * 4. Executes the "compile-actioman" command via the container's entrypoint.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the setup process is complete.
 */
export const setupContainer = async () => {
  await fs.mkdir(cacheLocalPath, { recursive: true });
  await fs.mkdir(cacheProjectLocalPath, { recursive: true });
  await fs.mkdir(scriptsLocalPath, { recursive: true });

  await bootstrapContainer();

  const { entrypoint, clearAppSource } = await initializeContainerCliHelpers(
    {},
  );

  await clearAppSource().exited;
  await entrypoint("compile-actioman").exited;
};

/**
 * Cleans up the container environment by terminating any running container processes.
 *
 * This function initializes the container CLI helpers and executes the `killExec` command
 * to ensure that all container-related processes are properly terminated.
 *
 * @returns A promise that resolves once the container cleanup process has completed.
 */
export const cleanupContainer = async () => {
  const { killExec } = await initializeContainerCliHelpers({});
  await killExec().exited;
};
