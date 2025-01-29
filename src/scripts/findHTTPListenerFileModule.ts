import { findActiomanNodeModulesPaths } from "./findNodeModulesPaths.js";

export async function findHTTPListenerFileModule(cwd: URL) {
  const actiomanNodeModulePath: URL | null =
    (await findActiomanNodeModulesPaths(cwd).next()).value ?? null;
  if (!actiomanNodeModulePath) throw new Error("actioman is not installed");
  const actionsFolder = new URL(
    "./lib/esm/http-router/http-listener.js",
    actiomanNodeModulePath,
  );
  return actionsFolder;
}
