import fsSync from "fs";
import fs from "fs/promises";
import { docker } from "./docker";
import { getStoredContainerPID } from "./get_stored_container_pid";
import { scriptsLocalPath } from "./constants/scripts_local_path";
import { appSourceContainerPath } from "./constants/app_source_container_path";
/**
 * Ensures that a snap file exists at the given relative path under the scripts directory.
 *
 * If the file does not exist, it is created as an empty file. The function also ensures
 * that the parent directory exists. This is useful for preparing script files needed
 * for integration or containerized tests.
 *
 * @param {string} relativePath - The relative path to the snap file within the scripts directory.
 * @returns {Promise<URL>} The local URL to the prepared snap file.
 */
export const prepareSnapFile = async (relativePath) => {
  const snapPath = new URL(relativePath, scriptsLocalPath);
  await fs.mkdir(new URL("./", snapPath), { recursive: true });
  if (!fsSync.existsSync(snapPath)) {
    await fs.writeFile(snapPath, ``);
    // console.log(`Script created at: ${snapPath}`);
  }
  return snapPath;
};
/**
 * Prepares a script file for use inside the Docker container.
 *
 * This function ensures that the specified script file exists locally under the scripts directory for the given project.
 * If the file does not exist, it is created as an empty file. The script is then copied into the running Docker container
 * at the appropriate application source path. This is useful for integration tests that require dynamic script preparation
 * and injection into a containerized environment.
 *
 * @param {string} projectName - The name of the project. Used as a subdirectory under the scripts directory.
 * @param {string} relativePath - The relative path to the script file within the project's scripts directory.
 * @returns {Promise<URL>} The local URL to the prepared script file.
 * @throws {Error} If no running container is found to copy the script into.
 */
export const prepareScript = async (projectName, relativePath) => {
  const containerID = await getStoredContainerPID();
  if (!containerID) {
    throw new Error("No container found to prepare script.");
  }
  const scriptLocalPath = await prepareSnapFile(
    `${projectName}/${relativePath}`,
  );
  const scriptContainerPath = new URL(relativePath, appSourceContainerPath);
  await docker(
    "cp",
    scriptLocalPath.pathname,
    `${containerID}:${scriptContainerPath.pathname}`,
  );
  return scriptLocalPath;
};
