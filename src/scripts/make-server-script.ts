import escodegen from "escodegen";

export const makeServerScript = async (cwd: string) => {
  const source = escodegen.generate({
    type: "Program",
    body: [
      {
        type: "ImportDeclaration",
        specifiers: [
          {
            type: "ImportSpecifier",
            start: 9,
            end: 12,
            imported: {
              type: "Identifier",
              start: 9,
              end: 12,
              name: "asd",
            },
            local: {
              type: "Identifier",
              start: 9,
              end: 12,
              name: "asd",
            },
          },
        ],
        source: {
          type: "Literal",
          start: 20,
          end: 25,
          value: "asd",
          raw: '"asd"',
        },
      },
    ],
    sourceType: "module",
  });

  console.log(source);
};
