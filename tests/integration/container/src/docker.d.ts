import { DockerProcess } from "./docker_process";
/**
 * Spawns a Docker process and provides access to its output streams and exit status.
 *
 * @param {...string} args - Arguments to pass to the Docker CLI.
 * @returns {DockerProcess} An object for interacting with the running Docker process.
 */
export declare const docker: (...args: string[]) => DockerProcess;
