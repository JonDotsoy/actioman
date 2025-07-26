import { actiomanSourceContainerPath } from "./constants/actioman_source_container_path";
import { appSourceContainerPath } from "./constants/app_source_container_path";
import { bunSourceContainerPath } from "./constants/bun_source_container_path";
import { cacheLocalPath } from "./constants/cache_local_path";
import { cacheProjectLocalPath } from "./constants/cache_project_local_path";
import { ACTIOMAN_CONTAINER_PORTS } from "./constants/container_ports";
import { CONTAINER_TIMEOUT_SECONDS } from "./constants/container_timeout_seconds";
import { IMAGE_NAME } from "./constants/image_name";
import { projectLocalPath } from "./constants/project_local_path";
import { PROJECT_SOURCE_PATHS } from "./constants/project_source_paths";
import { containerScriptsContainerPath } from "./container_scripts_container_path";
import { containerScriptsLocalPath } from "./container_scripts_local_path";
import { docker } from "./docker";
import { PROJECT_CACHE_PATHS } from "./project_cache_paths";
export const dockerRun = (options) => {
  const containerTimeoutSeconds =
    options?.containerTimeoutSeconds ?? CONTAINER_TIMEOUT_SECONDS;
  const publishPorts = options?.publishPorts ?? [];
  const tty = options?.tty ?? undefined;
  const stdin = options?.stdin ?? undefined;
  const detached = options?.detached ?? undefined;
  const rm = options?.rm ?? undefined;
  const workdir = options?.workdir ?? undefined;
  const env = options?.env ?? {};
  const volumes = options?.volumes ?? {};
  const networkMode = options?.networkMode ?? "host";
  const command = options?.command ?? [];
  const containerID = options?.containerID ?? undefined;
  /**
   * An array of strings representing the arguments to be passed to the Docker command.
   * This can be used to customize the behavior of Docker containers during execution.
   */
  const dockerArgs = [];
  // publishPorts
  for (const port of publishPorts) {
    if (Array.isArray(port)) {
      dockerArgs.push("-p", `${port[0]}:${port[1]}`);
    } else {
      dockerArgs.push("-p", `${port}:${port}`);
    }
  }
  // tty
  if (tty) {
    dockerArgs.push("-t");
  }
  // stdin
  if (stdin) {
    dockerArgs.push("-i");
  }
  // detached
  if (detached) {
    dockerArgs.push("-d");
  }
  // rm
  if (rm) {
    dockerArgs.push("--rm");
  }
  // workdir
  if (workdir) {
    dockerArgs.push("--workdir", workdir);
  }
  // env
  for (const [key, value] of Object.entries(env)) {
    dockerArgs.push("-e", `${key}=${value}`);
  }
  // volumes
  for (const [hostPath, containerPath] of Object.entries(volumes)) {
    dockerArgs.push("-v", `${containerPath.pathname}:${hostPath}`);
  }
  // networkMode
  if (networkMode) {
    dockerArgs.push("--network", networkMode);
  }
  // containerID
  if (containerID) {
    dockerArgs.push("--name", containerID);
  }
  // command
  if (command.length > 0) {
    dockerArgs.push(...command);
  }
  // /*
  //  * Docker arguments for container ports
  //  */
  // for (const port of Object.values(ACTIOMAN_CONTAINER_PORTS)) {
  //   dockerArgs.push("-p", `${port}:${port}`);
  // }
  // for (const sourcePath of PROJECT_SOURCE_PATHS) {
  //   dockerArgs.push(
  //     "-v",
  //     `${new URL(sourcePath, projectLocalPath).pathname}:${new URL(sourcePath, actiomanSourceContainerPath).pathname}`
  //   );
  // }
  // for (const cachePath of PROJECT_CACHE_PATHS) {
  //   dockerArgs.push(
  //     "-v",
  //     `${new URL(cachePath, cacheProjectLocalPath).pathname}:${new URL(cachePath, actiomanSourceContainerPath).pathname}`
  //   );
  // }
  // dockerArgs.push(
  //   "-v",
  //   `${new URL("bun_cache/", cacheLocalPath).pathname}:${bunSourceContainerPath.pathname}`
  // );
  // dockerArgs.push(
  //   "-v",
  //   `${containerScriptsLocalPath.pathname}:${containerScriptsContainerPath.pathname}`
  // );
  return docker(
    "run",
    // "--network",
    // "host",
    // "-d", // run in detached mode
    // "--rm", // remove the container when it exits
    // "--workdir",
    // appSourceContainerPath.pathname,
    ...dockerArgs,
  );
};
