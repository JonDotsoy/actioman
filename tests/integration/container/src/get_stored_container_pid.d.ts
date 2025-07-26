/**
 * Retrieves the PID of a running Docker container from disk, verifying it is still running.
 *
 * @returns {Promise<string | null>} The PID if the container is running, or null otherwise.
 */
export declare const getStoredContainerPID: () => Promise<string | null>;
