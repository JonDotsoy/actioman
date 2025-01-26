import { findActiomanNodeModulesPaths } from "./findNodeModulesPaths.js";

export async function findActionTargetFileModule(cwd: URL) {
  const actiomanNodeModulePath: URL | null =
    (await findActiomanNodeModulesPaths(cwd).next()).value ?? null;
  if (!actiomanNodeModulePath) throw new Error("actioman is not installed");
  const actionsFolder = new URL(
    "./lib/esm/actions-target/actions-target.js",
    actiomanNodeModulePath,
  );
  return actionsFolder;
}
