import type { killContainerOptions } from "./dtos/kill_container_options";
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
export declare const killContainer: (
  options?: killContainerOptions,
) => Promise<void>;
