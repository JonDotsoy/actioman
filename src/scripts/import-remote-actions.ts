import { ActionsDocument } from "../exporter-actions/exporter-actions.js";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";

type JsonDBRecord = {
  key: string[],
  value: any,
}

class JsonDB {
  private constructor(readonly location: URL, private body: Array<JsonDBRecord>) { }
  async read() {
    if (!existsSync(this.location)) return;
    const payload = await fs.readFile(this.location, "utf-8")
    this.body = payload.split('\n').map(e => JSON.parse(e));
  }
  async save() {
    await fs.writeFile(this.location, this.body.map(e => JSON.stringify(e)).join('\n'));
  }
  set(key: string[], value: any) {
    const v: null | JsonDBRecord = this.get(key)
    if (v) v.value = value;
    else this.body.push({ key, value })
  }
  get(key: string[]) {
    return this.body.find(e => JSON.stringify(e.key) === JSON.stringify(key)) ?? null;
  }
  has(key: string[]) {
    return this.get(key) !== null;
  }
  delete(key: string[]) {
    this.body = this.body.filter(e => JSON.stringify(e.key) !== JSON.stringify(key));
  }
  static async open(location: URL) {
    const jsonDB = new JsonDB(location, []);
    await jsonDB.read();
    return jsonDB
  }
}

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
    `export { default as ${actionsName} } from './remote_actions/${actionsName}.js';\n`,
  );
  console.log(`imported "${name}" from ${url}`);
};
