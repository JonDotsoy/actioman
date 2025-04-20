import fs from "fs/promises";
import { cacheLocalPath } from "./constants/cache_local_path";
import { cacheProjectLocalPath } from "./constants/cache_project_local_path";
import { scriptsLocalPath } from "./constants/scripts_local_path";
import { bootstrapContainer } from "./bootstrap_container";
import { killContainer } from "./kill_container";
import { initializeActiomanCli } from "./initialize_actioman_cli";

/**
 * Ensures required local directories for container integration tests exist.
 * Creates cache, project cache, and scripts directories if they do not exist.
 *
 * @returns {Promise<void>} Resolves when all directories are created.
 */
export const setupContainer = async () => {
  await fs.mkdir(cacheLocalPath, { recursive: true });
  await fs.mkdir(cacheProjectLocalPath, { recursive: true });
  await fs.mkdir(scriptsLocalPath, { recursive: true });

  await bootstrapContainer();
};

export const cleanupContainer = async () => {
  const { killExec, clearAppSource } = await initializeActiomanCli({});
  await killExec().exited;
  await clearAppSource().exited;
};
