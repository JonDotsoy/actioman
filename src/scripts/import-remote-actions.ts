import { ActionsDocument } from "../exporter-actions/exporter-actions";
import * as fs from "fs/promises";
import * as path from "path";

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
      if (await fs.exists(proposalNodeModules)) {
        yield proposalNodeModules;
      }
    } catch {}
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

  const shareActionsFileModule = await findShareActionsFileModule(cwdUrl);

  const actionsName = normalizeName(name);
  const actionsDocumentTargetURL = new URL(
    `./remote_actions/${actionsName}.js`,
    shareActionsFileModule,
  );
  await fs.mkdir(new URL("./", actionsDocumentTargetURL), { recursive: true });

  await fs.writeFile(
    actionsDocumentTargetURL,
    (await ActionsDocument.fromHTTPServer(new URL(url))).toString(),
  );
  console.log(
    `Wrote "${name}" to ${path.relative(cwd, actionsDocumentTargetURL.pathname)}`,
  );

  await fs.appendFile(
    shareActionsFileModule,
    `export { default as ${actionsName} } from './${actionsName}.js';\n`,
  );
  console.log(`imported "${name}" from ${url}`);
};
