import { existsSync } from "fs";

enum Type {
  YAML,
  JSON,
  TOML,
  JS,
}

const getType = (sourceLocation: URL) => {
  const pathname = sourceLocation.pathname.toLowerCase();

  if (pathname.endsWith(".yaml")) return Type.YAML;
  if (pathname.endsWith(".yml")) return Type.YAML;
  if (pathname.endsWith(".json")) return Type.JSON;
  if (pathname.endsWith(".toml")) return Type.TOML;
  if (pathname.endsWith(".js")) return Type.JS;
  if (pathname.endsWith(".ts")) return Type.JS;
  if (pathname.endsWith(".mjs")) return Type.JS;

  throw new Error(`Unknown file type: ${pathname}`);
};

const getLoader = async (type: Type) => {
  if (type === Type.YAML) return (await import("./loaders/yaml.js")).default;
  if (type === Type.JSON) return (await import("./loaders/json.js")).default;
  if (type === Type.TOML) return (await import("./loaders/toml.js")).default;
  if (type === Type.JS) return (await import("./loaders/js.js")).default;

  throw new Error("Unknown file type");
};

function* listAlternativeOptionsFiles(dirPath: URL, name: string) {
  yield new URL(`${name}.js`, dirPath);
  yield new URL(`${name}.ts`, dirPath);
  yield new URL(`${name}.mjs`, dirPath);
  yield new URL(`${name}.json`, dirPath);
  yield new URL(`${name}.yaml`, dirPath);
  yield new URL(`${name}.toml`, dirPath);
  yield new URL(`.${name}.js`, dirPath);
  yield new URL(`.${name}.ts`, dirPath);
  yield new URL(`.${name}.mjs`, dirPath);
  yield new URL(`.${name}.json`, dirPath);
  yield new URL(`.${name}.yaml`, dirPath);
  yield new URL(`.${name}.toml`, dirPath);
}

async function* listOptionsFiles(dirPath: URL, name: string) {
  for (const alternativeOptionsFile of listAlternativeOptionsFiles(
    dirPath,
    name,
  )) {
    if (await existsSync(alternativeOptionsFile)) yield alternativeOptionsFile;
  }
}

export const factory = async (sourceLocation: string) => {
  const sourceLocationUrl = new URL(sourceLocation);
  const type = getType(sourceLocationUrl);
  const loader = await getLoader(type);

  return await loader(sourceLocationUrl.toString());
};

export const findOn = async (sourceLocation: string, name: string) => {
  const sourceLocationUrl = new URL(sourceLocation);

  for await (const optionsFile of listOptionsFiles(sourceLocationUrl, name)) {
    return await factory(optionsFile.toString());
  }

  return null;
};

factory.findOn = findOn;

export default factory;
