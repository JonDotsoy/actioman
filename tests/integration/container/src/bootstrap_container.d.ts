import type { bootstrapContainerOptions } from "./dtos/bootstrap_container_options";
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
export declare const bootstrapContainer: (
  options?: bootstrapContainerOptions,
) => Promise<string>;
