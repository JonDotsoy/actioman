import fsSync from "fs";
import fs from "fs/promises";

import { docker } from "./docker";
import { getStoredContainerPID } from "./get_stored_container_pid";
import { scriptsLocalPath } from "./constants/scripts_local_path";
import { appSourceContainerPath } from "./constants/app_source_container_path";

/**
 * Prepares a script file for use inside the Docker container.
 *
 * - Ensures the script exists locally and copies it into the container.
 *
 * @param {string} projectName - The name of the project.
 * @param {string} relativePath - The relative path to the script.
 * @returns {Promise<URL>} The local path to the prepared script.
 */
export const prepareScript = async (
  projectName: string,
  relativePath: string,
) => {
  const containerID = await getStoredContainerPID();
  if (!containerID) {
    throw new Error("No container found to prepare script.");
  }
  const scriptLocalPath = new URL(
    relativePath,
    new URL(`./${projectName}/`, scriptsLocalPath),
  );
  const scriptContainerPath = new URL(relativePath, appSourceContainerPath);
  await fs.mkdir(new URL("./", scriptLocalPath), { recursive: true });
  if (!fsSync.existsSync(scriptLocalPath)) {
    await fs.writeFile(scriptLocalPath, ``);
    // console.log(`Script created at: ${scriptLocalPath}`);
  }
  await docker(
    "cp",
    scriptLocalPath.pathname,
    `${containerID}:${scriptContainerPath.pathname}`,
  );
  return scriptLocalPath;
};
