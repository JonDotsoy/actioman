import { listNodeModulesPaths } from "./listNodeModulesPaths.js";

export function* listActiomanNodeModulesPaths(cwd: URL): Generator<URL> {
  for (const proposalNodeModules of listNodeModulesPaths(cwd)) {
    yield new URL("./actioman/", proposalNodeModules);
  }
}
