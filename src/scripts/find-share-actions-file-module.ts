import { findNodeModulesPaths } from "./findNodeModulesPaths.js";

export async function findShareActionsFileModule(cwd: URL) {
  const actiomanNodeModulePath: URL | null =
    (await findNodeModulesPaths(cwd).next()).value ?? null;
  if (!actiomanNodeModulePath) throw new Error("actioman is not installed");
  const actionsFolder = new URL(
    "./lib/esm/share-actions/share-actions.js",
    actiomanNodeModulePath,
  );
  return actionsFolder;
}
