import { findActiomanNodeModulesPaths } from "./findNodeModulesPaths.js";

export async function makebootstrapHTTPListenerFileModule(cwd: URL) {
  const actiomanNodeModulePath: URL | null =
    (await findActiomanNodeModulesPaths(cwd).next()).value ?? null;
  if (!actiomanNodeModulePath) throw new Error("actioman is not installed");
  const actionsFolder = new URL("./.cache/serve.js", actiomanNodeModulePath);
  return actionsFolder;
}
