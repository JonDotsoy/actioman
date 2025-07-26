/**
 * Stores the PID of the running Docker container to a file for later retrieval.
 *
 * @param {string} pid - The PID of the running container.
 * @returns {Promise<void>} Resolves when the PID is written to disk.
 */
export declare const storeContainerPID: (pid: string) => Promise<void>;
