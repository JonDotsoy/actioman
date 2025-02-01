import { findActiomanNodeModulesPaths } from "./findNodeModulesPaths.js";

export async function findConfigsFileModule(cwd: URL) {
  const actiomanNodeModulePath: URL | null =
    (await findActiomanNodeModulesPaths(cwd).next()).value ?? null;
  if (!actiomanNodeModulePath) throw new Error("actioman is not installed");
  const actionsFolder = new URL(
    "./lib/esm/configs/configs.js",
    actiomanNodeModulePath,
  );
  return actionsFolder;
}
