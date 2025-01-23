import { ActionsDocument } from "../exporter-actions/exporter-actions.js";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";
import { ActionmanLockFile } from "../actioman-lock-file/actioman-lock-file.js";

function* listNodeModulesPaths(cwd: URL): Generator<URL> {
  const proposalNodeModules = new URL("./node_modules/", cwd);
  yield proposalNodeModules;
  const parent = new URL("../", cwd);
  if (parent.pathname === cwd.pathname) return;
  yield* listNodeModulesPaths(parent);
}

function* listActiomanNodeModulesPaths(cwd: URL): Generator<URL> {
  for (const proposalNodeModules of listNodeModulesPaths(cwd)) {
    yield new URL("./actioman/", proposalNodeModules);
  }
}

async function* findNodeModulesPaths(cwd: URL): AsyncGenerator<URL> {
  for (const proposalNodeModules of listActiomanNodeModulesPaths(cwd)) {
    try {
      if (await existsSync(proposalNodeModules)) {
        yield proposalNodeModules;
      }
    } catch (ex) {}
  }
}

async function findShareActionsFileModule(cwd: URL) {
  const actiomanNodeModulePath: URL | null =
    (await findNodeModulesPaths(cwd).next()).value ?? null;
  if (!actiomanNodeModulePath) throw new Error("actioman is not installed");
  const actionsFolder = new URL(
    "./lib/esm/share-actions/share-actions.js",
    actiomanNodeModulePath,
  );
  return actionsFolder;
}

const normalizeName = (name: string) => {
  const pipes: ((value: string) => string)[] = [
    (value) => value.replace(/\W+/g, " "),
    (value) => value.trim(),
    (value) => value.replace(/\s+(\w)/g, (_, e) => e.toUpperCase()),
    (value) => value.replace(/^([^a-z_])/, "_$1"),
  ];
  return pipes.reduce((acc, fn) => fn(acc), name);
};

export const importRemoteActions = async (
  url: URL,
  name: string,
  cwd: string,
) => {
  const cwdUrl = new URL(cwd, "file://");

  const actiomanLockFileLocation = new URL("./.actioman.lock.json", cwdUrl);
  const shareActionsFileModule = await findShareActionsFileModule(cwdUrl);

  const actiomanLockFile = await ActionmanLockFile.open(
    actiomanLockFileLocation,
  );

  const actionsName = normalizeName(name);
  const actionsDocumentTargetURL = new URL(
    `./remote_actions/${actionsName}.js`,
    shareActionsFileModule,
  );
  await fs.mkdir(new URL("./", actionsDocumentTargetURL), { recursive: true });

  const actionsDocument = await ActionsDocument.fromHTTPServer(new URL(url));
  await fs.writeFile(actionsDocumentTargetURL, actionsDocument.toString());
  console.log(
    `Wrote "${name}" to ${path.relative(cwd, actionsDocumentTargetURL.pathname)}`,
  );

  actiomanLockFile.addRemote(actionsName, url, actionsDocument.actionsJson);

  await fs.appendFile(
    shareActionsFileModule,
    `export { default as ${actionsName} } from './remote_actions/${actionsName}.js';\n`,
  );
  await actiomanLockFile.save();
  console.log(`imported "${name}" from ${url}`);
};
