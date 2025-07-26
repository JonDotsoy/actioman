import { initializeContainerCliHelpers } from "./initialize_container_cli_helpers";
import { arrange } from "./utils/arrange";
/**
 * Sets up a workspace for testing by initializing a containerized environment
 * with the specified options. This function prepares the workspace, optionally
 * initializes it, and installs Actioman if required.
 *
 * @param options - Configuration options for setting up the workspace.
 * @param options.name - The name of the workspace to set up.
 * @param options.files - An optional array of files to prepare in the workspace.
 * @param options.initWorkspace - A boolean indicating whether to initialize the workspace (default: `false`).
 * @param options.installActioman - A boolean indicating whether to install Actioman in the workspace (default: `false`).
 *
 * @returns A function that, when executed, initializes the container CLI helpers
 * and performs the setup tasks as specified in the options.
 */
export const setupWorkspaceForTesting = (options) => {
  const name = options.name;
  const files = options.files ?? [];
  const initWorkspace = options.initWorkspace ?? false;
  const installActioman = options.installActioman ?? false;
  return arrange(async () => {
    const containerCliHelpers = await initializeContainerCliHelpers({
      workspace: name,
    });
    const { shell, entrypoint, prepareFile } = containerCliHelpers;
    for (const file of files) {
      await prepareFile(name, file);
    }
    if (initWorkspace) {
      await shell("bun", "init").exited;
    }
    if (installActioman) {
      await entrypoint("install-actioman").exited;
    }
    return containerCliHelpers;
  });
};
