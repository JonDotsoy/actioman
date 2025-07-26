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
export declare const prepareSnapFile: (relativePath: string) => Promise<URL>;
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
export declare const prepareScript: (
  projectName: string,
  relativePath: string,
) => Promise<URL>;
