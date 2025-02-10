import * as fs from "fs/promises";
import { httpListenActionTemplate } from "../gens-templates/http-listen-action.template.js";
import { makebootstrapHTTPListenerFileModule } from "./makebootstrapHTTPListenerFileModule.js";
import { executablesPaths } from "../executables_paths/executables_paths.js";

export const makeServerScript = async (
  cwd: string,
  actionsPath: string,
  withHttp2Listener: boolean = false,
) => {
  const bootstrapLocation = await makebootstrapHTTPListenerFileModule(
    new URL(cwd, "file://"),
  );

  await fs.mkdir(new URL("./", bootstrapLocation), { recursive: true });

  const modules = {
    httpListenerModuleLocation: withHttp2Listener
      ? executablesPaths.HTTP2_LISTENER_PATH.pathname
      : executablesPaths.HTTP_LISTENER_PATH.pathname,
    configsModuleLocation: executablesPaths.CONFIG_PATH.pathname,
    configsFactoryModuleLocation: executablesPaths.FACTORY_PATH.pathname,
  };

  await fs.writeFile(
    bootstrapLocation,
    httpListenActionTemplate({
      target: bootstrapLocation.pathname,
      actionFileLocation: actionsPath,
      workspaceLocation: cwd,
      modules,
    }),
  );

  return {
    bootstrapLocation,
    modules,
  };
};
