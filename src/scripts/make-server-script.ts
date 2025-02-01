import * as fs from "fs/promises";
import { httpListenActionTemplate } from "../gens-templates/http-listen-action.template.js";
import { findHTTPListenerFileModule } from "./findHTTPListenerFileModule.js";
import { makebootstrapHTTPListenerFileModule } from "./makebootstrapHTTPListenerFileModule.js";
import { findConfigsFactoryFileModule } from "./findConfigsFactoryFileModule.js";

export const makeServerScript = async (cwd: string, actionsPath: string) => {
  const httpListenerLocation = await findHTTPListenerFileModule(
    new URL(cwd, "file://"),
  );
  const configsFactoryLocation = await findConfigsFactoryFileModule(
    new URL(cwd, "file://"),
  );
  const bootstrapLocation = await makebootstrapHTTPListenerFileModule(
    new URL(cwd, "file://"),
  );

  await fs.mkdir(new URL("./", bootstrapLocation), { recursive: true });

  await fs.writeFile(
    bootstrapLocation,
    httpListenActionTemplate({
      target: bootstrapLocation.pathname,
      actionFileLocation: actionsPath,
      workspaceLocation: cwd,
      modules: {
        httpListenerModuleLocation: httpListenerLocation.pathname,
        configsFactoryModuleLocation: configsFactoryLocation.pathname,
      },
    }),
  );

  return {
    bootstrapLocation: bootstrapLocation.toString(),
    httpListenerLocation: httpListenerLocation.toString(),
  };
};
