import escodegen from "escodegen";
import * as path from "path";

type ProgramASTProps = {
  httpListenerModuleLocation: string;
  configsFactoryModuleLocation: string;
  actionFileLocation: string;
  workspaceLocation: string;
};

const getProgramAST = (props: ProgramASTProps) => ({
  type: "Program",
  body: [
    {
      type: "ImportDeclaration",
      specifiers: [
        {
          type: "ImportSpecifier",
          local: {
            type: "Identifier",
            name: "HTTPLister",
          },
          imported: {
            type: "Identifier",
            name: "HTTPLister",
          },
        },
      ],
      source: {
        type: "Literal",
        value: props.httpListenerModuleLocation,
      },
    },
    {
      type: "ImportDeclaration",
      specifiers: [
        {
          type: "ImportSpecifier",
          local: {
            type: "Identifier",
            name: "factory",
          },
          imported: {
            type: "Identifier",
            name: "factory",
          },
        },
      ],
      source: {
        type: "Literal",
        value: props.configsFactoryModuleLocation,
      },
    },

    {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "PORT",
          },
          init: {
            type: "MemberExpression",
            computed: false,
            object: {
              type: "MemberExpression",
              computed: false,
              object: {
                type: "Identifier",
                name: "process",
              },
              property: {
                type: "Identifier",
                name: "env",
              },
            },
            property: {
              type: "Identifier",
              name: "PORT",
            },
          },
        },
      ],
      kind: "const",
    },
    {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "HOST",
          },
          init: {
            type: "MemberExpression",
            computed: false,
            object: {
              type: "MemberExpression",
              computed: false,
              object: {
                type: "Identifier",
                name: "process",
              },
              property: {
                type: "Identifier",
                name: "env",
              },
            },
            property: {
              type: "Identifier",
              name: "HOST",
            },
          },
        },
      ],
      kind: "const",
    },

    {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "bootstrap",
          },
          init: {
            type: "ArrowFunctionExpression",
            id: null,
            params: [],
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "VariableDeclaration",
                  declarations: [
                    {
                      type: "VariableDeclarator",
                      id: {
                        type: "Identifier",
                        name: "configs",
                      },
                      init: {
                        type: "CallExpression",
                        callee: {
                          type: "MemberExpression",
                          computed: false,
                          object: {
                            type: "Identifier",
                            name: "Configs",
                          },
                          property: {
                            type: "Identifier",
                            name: "fromModule",
                          },
                        },
                        arguments: [
                          {
                            type: "AwaitExpression",
                            argument: {
                              type: "CallExpression",
                              callee: {
                                type: "MemberExpression",
                                computed: false,
                                object: {
                                  type: "Identifier",
                                  name: "factory",
                                },
                                property: {
                                  type: "Identifier",
                                  name: "findOn",
                                },
                              },
                              arguments: [
                                {
                                  type: "CallExpression",
                                  callee: {
                                    type: "MemberExpression",
                                    computed: false,
                                    object: {
                                      type: "NewExpression",
                                      callee: {
                                        type: "Identifier",
                                        name: "URL",
                                      },
                                      arguments: [
                                        {
                                          type: "Literal",
                                          value: props.workspaceLocation,
                                        },
                                        {
                                          type: "MemberExpression",
                                          computed: false,
                                          object: {
                                            type: "MemberExpression",
                                            computed: false,
                                            object: {
                                              type: "Identifier",
                                              name: "import",
                                            },
                                            property: {
                                              type: "Identifier",
                                              name: "meta",
                                            },
                                          },
                                          property: {
                                            type: "Identifier",
                                            name: "url",
                                          },
                                        },
                                      ],
                                    },
                                    property: {
                                      type: "Identifier",
                                      name: "toString",
                                    },
                                  },
                                  arguments: [],
                                },
                                {
                                  type: "Literal",
                                  value: "configs",
                                  raw: '"configs"',
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                  kind: "const",
                },
                {
                  type: "VariableDeclaration",
                  declarations: [
                    {
                      type: "VariableDeclarator",
                      id: {
                        type: "Identifier",
                        name: "httpLister",
                      },
                      init: {
                        type: "AwaitExpression",
                        argument: {
                          type: "CallExpression",
                          callee: {
                            type: "MemberExpression",
                            computed: false,
                            object: {
                              type: "Identifier",
                              name: "HTTPLister",
                            },
                            property: {
                              type: "Identifier",
                              name: "fromModule",
                            },
                          },
                          arguments: [
                            {
                              type: "AwaitExpression",
                              argument: {
                                type: "CallExpression",
                                callee: {
                                  type: "Identifier",
                                  name: "import",
                                },
                                arguments: [
                                  {
                                    type: "Literal",
                                    value: props.actionFileLocation,
                                  },
                                ],
                              },
                            },
                            {
                              type: "Identifier",
                              name: "configs",
                            },
                          ],
                        },
                      },
                    },
                  ],
                  kind: "const",
                },
                {
                  type: "VariableDeclaration",
                  declarations: [
                    {
                      type: "VariableDeclarator",
                      id: {
                        type: "Identifier",
                        name: "url",
                      },
                      init: {
                        type: "AwaitExpression",
                        argument: {
                          type: "CallExpression",
                          callee: {
                            type: "MemberExpression",
                            computed: false,
                            object: {
                              type: "Identifier",
                              name: "httpLister",
                            },
                            property: {
                              type: "Identifier",
                              name: "listen",
                            },
                          },
                          arguments: [
                            { type: "Identifier", name: "PORT" },
                            { type: "Identifier", name: "HOST" },
                          ],
                        },
                      },
                    },
                  ],
                  kind: "const",
                },
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "MemberExpression",
                      computed: false,
                      object: {
                        type: "Identifier",
                        name: "console",
                      },
                      property: {
                        type: "Identifier",
                        name: "log",
                      },
                    },
                    arguments: [
                      {
                        type: "TemplateLiteral",
                        quasis: [
                          {
                            type: "TemplateElement",
                            value: {
                              raw: "Server running at ",
                            },
                            tail: false,
                          },
                          {
                            type: "TemplateElement",
                            value: {
                              raw: "",
                            },
                            tail: true,
                          },
                        ],
                        expressions: [
                          {
                            type: "CallExpression",
                            callee: {
                              type: "MemberExpression",
                              computed: false,
                              object: {
                                type: "Identifier",
                                name: "url",
                              },
                              property: {
                                type: "Identifier",
                                name: "toString",
                              },
                            },
                            arguments: [],
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: true,
          },
        },
      ],
      kind: "const",
    },
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          computed: false,
          object: {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: "bootstrap",
            },
            arguments: [],
          },
          property: {
            type: "Identifier",
            name: "catch",
          },
        },
        arguments: [
          {
            type: "MemberExpression",
            computed: false,
            object: {
              type: "Identifier",
              name: "console",
            },
            property: {
              type: "Identifier",
              name: "error",
            },
          },
        ],
      },
    },
  ],
  sourceType: "module",
});

type Props = {
  target: string;
  actionFileLocation: string;
  workspaceLocation: string;
  modules: {
    httpListenerModuleLocation: string;
    configsFactoryModuleLocation: string;
  };
};

export const httpListenActionTemplate = (props: Props) => {
  const resolvePath = (target: string) => new URL(target, "file://");
  const filename = resolvePath(props.target);
  const dirname = new URL("./", filename);
  const actionFileLocation = resolvePath(props.actionFileLocation);
  const workspaceLocation = resolvePath(props.workspaceLocation);
  const httpListenerModuleLocation = resolvePath(
    props.modules.httpListenerModuleLocation,
  );
  const configsFactoryModuleLocation = resolvePath(
    props.modules.configsFactoryModuleLocation,
  );

  const relative = (path2: URL) => {
    return `./${path.relative(dirname.pathname, path2.pathname)}`;
  };

  const ast = getProgramAST({
    httpListenerModuleLocation: relative(httpListenerModuleLocation),
    configsFactoryModuleLocation: relative(configsFactoryModuleLocation),
    actionFileLocation: relative(actionFileLocation),
    workspaceLocation: `${relative(workspaceLocation)}/`,
  });

  return `// @ts-nocheck\n${escodegen.generate(ast)}`;
};
