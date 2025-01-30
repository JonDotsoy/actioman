import * as path from "path";
import escodegen from "escodegen";

type getProgramASTParams = {
  modules: {
    name: string;
    location: string;
  }[];
};

const getProgramAST = (params: getProgramASTParams) => ({
  type: "Program",
  body: [
    ...params.modules.map((module) => ({
      type: "ExportNamedDeclaration",
      declaration: null,
      specifiers: [
        {
          type: "ExportSpecifier",
          exported: {
            type: "Identifier",
            name: module.name,
          },
          local: {
            type: "Identifier",
            name: "default",
          },
        },
      ],
      source: {
        type: "Literal",
        value: module.location,
      },
    })),
  ],
  sourceType: "module",
});

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

  return escodegen.generate(ast);
};
