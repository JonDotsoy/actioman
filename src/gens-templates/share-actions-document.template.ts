import * as path from "path";
import {
  $,
  $doc,
  $export,
  $import,
  $object,
  render,
} from "./typescript-factory/typescript-factory.js";

type getProgramASTParams = {
  modules: {
    name: string;
    location: string;
  }[];
};

const getProgramAST = (params: getProgramASTParams) =>
  $doc([
    ...params.modules.map((module) =>
      $import(module.location, undefined, module.name),
    ),
    $export(
      $object(
        Object.fromEntries(
          params.modules.map((module) => [module.name, $(module.name)]),
        ),
      ),
    ),
  ]);

type Params = {
  fileLocation: string;
  importActionModules: {
    location: string;
    name: string;
  }[];
};

export const shareActionsTemplate = (params: Params) => {
  const ast = getProgramAST({
    modules: params.importActionModules.map((importActionModules) => ({
      name: importActionModules.name,
      location: `./${path.relative(
        new URL("./", new URL(params.fileLocation, "file://")).pathname,
        new URL(importActionModules.location, "file://").pathname,
      )}`,
    })),
  });

  return `// @ts-nocheck\n${render(ast)}`;
};
