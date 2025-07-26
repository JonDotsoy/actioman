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
export declare const setupContainer: () => Promise<void>;
/**
 * Cleans up the container environment by terminating any running container processes.
 *
 * This function initializes the container CLI helpers and executes the `killExec` command
 * to ensure that all container-related processes are properly terminated.
 *
 * @returns A promise that resolves once the container cleanup process has completed.
 */
export declare const cleanupContainer: () => Promise<void>;
