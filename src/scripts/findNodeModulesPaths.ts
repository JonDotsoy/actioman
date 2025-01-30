import { existsSync } from "fs";
import { listActiomanNodeModulesPaths } from "./listActiomanNodeModulesPaths.js";

export async function* findActiomanNodeModulesPaths(
  cwd: URL,
): AsyncGenerator<URL> {
  for (const proposalNodeModules of listActiomanNodeModulesPaths(cwd)) {
    try {
      if (await existsSync(proposalNodeModules)) {
        yield proposalNodeModules;
      }
    } catch (ex) {
      console.error(ex);
    }
  }
}
