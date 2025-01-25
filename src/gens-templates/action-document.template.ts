import * as path from "path";
import escodegen from "escodegen";
import type { ActionsDocument } from "../exporter-actions/exporter-actions";
import { get } from "@jondotsoy/utils-js/get";
import jsonSchemaToZod from "json-schema-to-zod";

type getProgramASTParams = {
  actionTargetUrl: string;
  actionModulePath: string;
  actionDefinitions: Record<
    string,
    {
      description: string | null | undefined;
      input?: string | null;
      output?: string | null;
    }
  >;
};

const g = (value: string | null | undefined) =>
  value === undefined
    ? {
        type: "Identifier",
        name: "undefined",
      }
    : {
        type: "Literal",
        value: value,
      };

const getProgramAST = (params: getProgramASTParams) => ({
  type: "Program",

  body: [
    {
      type: "ImportDeclaration",

      specifiers: [
        {
          type: "ImportSpecifier",

          imported: {
            type: "Identifier",

            name: "z",
          },
          local: {
            type: "Identifier",

            name: "z",
          },
        },
      ],
      source: {
        type: "Literal",

        value: "zod",
      },
    },
    {
      type: "ImportDeclaration",

      specifiers: [
        {
          type: "ImportSpecifier",

          imported: {
            type: "Identifier",

            name: "ActionsTarget",
          },
          local: {
            type: "Identifier",

            name: "ActionsTarget",
          },
        },
      ],
      source: {
        type: "Literal",

        value: params.actionModulePath,
      },
    },
    {
      type: "VariableDeclaration",

      declarations: [
        {
          type: "VariableDeclarator",

          id: {
            type: "Identifier",

            name: "createActionsTarget",
          },
          init: {
            type: "ArrowFunctionExpression",

            id: null,
            expression: true,
            generator: false,
            async: false,
            params: [],
            body: {
              type: "CallExpression",

              callee: {
                type: "MemberExpression",

                object: {
                  type: "NewExpression",

                  callee: {
                    type: "Identifier",

                    name: "ActionsTarget",
                  },
                  arguments: [
                    {
                      type: "Literal",

                      value: params.actionTargetUrl,
                    },
                    {
                      type: "ObjectExpression",

                      properties: [
                        ...Object.entries(params.actionDefinitions).map(
                          ([key, values]) => ({
                            type: "Property",
                            method: false,
                            shorthand: false,
                            computed: false,
                            key: {
                              type: "Identifier",
                              name: key,
                            },
                            value: {
                              type: "ObjectExpression",
                              properties: [
                                {
                                  type: "Property",
                                  key: {
                                    type: "Identifier",
                                    name: "description",
                                  },
                                  value: g(values.description),
                                },
                                {
                                  type: "Property",
                                  key: {
                                    type: "Identifier",
                                    name: "input",
                                  },
                                  value: {
                                    type: "Identifier",
                                    name: values.input,
                                  },
                                },
                                {
                                  type: "Property",
                                  key: {
                                    type: "Identifier",
                                    name: "output",
                                  },
                                  value: {
                                    type: "Identifier",
                                    name: values.output,
                                  },
                                },
                              ],
                            },
                            kind: "init",
                          }),
                        ),
                      ],
                    },
                  ],
                },
                property: {
                  type: "Identifier",

                  name: "compile",
                },
                computed: false,
                optional: false,
              },
              arguments: [],
              optional: false,
            },
          },
        },
      ],
      kind: "const",
    },
    {
      type: "ExportDefaultDeclaration",

      declaration: {
        type: "Identifier",

        name: "createActionsTarget",
      },
    },
  ],
  sourceType: "module",
});

type Params = {
  cwd: string;
  actionTargetModuleLocation: string;
  actionsDocument: ActionsDocument;
};

export const actionDocumentTemplate = (params: Params) => {
  const toJsonZod = (value: Record<any, any> | undefined) => {
    if (value) return jsonSchemaToZod(value);
    return "undefined";
  };

  const ast = getProgramAST({
    actionModulePath: `./${path.relative(new URL(params.cwd, "file://").pathname, new URL(params.actionTargetModuleLocation, "file://").pathname)}`,
    actionTargetUrl: params.actionsDocument.targetUrl.toString(),
    actionDefinitions: Object.fromEntries(
      Array.from(
        Object.entries(params.actionsDocument.actionsJson),
        ([key, actionDescription]) => [
          key,
          {
            description: get.string(actionDescription, "description"),
            input: toJsonZod(get.record(actionDescription, "input")),
            output: toJsonZod(get.record(actionDescription, "output")),
          },
        ],
      ),
    ),
  });

  return escodegen.generate(ast);
};
