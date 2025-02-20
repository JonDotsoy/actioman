import * as ts from "typescript";

const $expressionOrIdentifier = (value: string | ts.Expression) =>
  typeof value === "string" ? $indentifier(value) : value;
export const $indentifier = (name: string) => ts.factory.createIdentifier(name);

type $propertyProps = [
  ...expressions: (string | ts.Expression)[],
  name: string | ts.MemberName,
];

export const $ = (...props: $propertyProps) => {
  if (props.length === 1 && typeof props[0] === "string")
    return $indentifier(props[0]);
  return props.reduce((expression: any, name: any) => {
    if (!expression) return $expressionOrIdentifier(name);
    return ts.factory.createPropertyAccessExpression(
      $expressionOrIdentifier(expression),
      $indentifier(name),
    );
  }) as ts.Expression;
};

export const $const = (name: string, initializer?: any) =>
  ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(name),
          undefined,
          undefined,
          initializer,
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

export const $let = (name: string, initializer: any) =>
  ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(name),
          undefined,
          undefined,
          initializer,
        ),
      ],
      ts.NodeFlags.Let,
    ),
  );

export const $import = (modelueName: string, exports?: string[]) => {
  return ts.factory.createImportDeclaration(
    [],
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ...(exports?.map((exportName) =>
          ts.factory.createImportSpecifier(
            false,
            undefined,
            $indentifier(exportName),
          ),
        ) ?? []),
      ]),
    ),
    ts.factory.createStringLiteral(modelueName),
  );
};

export const $asyncArrowFunction = (statements: ts.Statement[] = []) => {
  return ts.factory.createArrowFunction(
    [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
    undefined,
    [],
    undefined,
    undefined,
    ts.factory.createBlock(statements, true),
  );
};

export const $await = (expression: ts.Expression) =>
  ts.factory.createAwaitExpression(expression);

/** @deprecated prefer {@link $await} */
export const $awaitCall = (
  expression: string | ts.Expression,
  ...args: ts.Expression[]
) => ts.factory.createAwaitExpression($call(expression, ...args));

export const $new = (
  expression: string | ts.Expression,
  ...args: ts.Expression[]
) =>
  ts.factory.createNewExpression(
    $expressionOrIdentifier(expression),
    undefined,
    args,
  );

export const $call = (
  expression: string | ts.Expression,
  ...args: ts.Expression[]
) =>
  ts.factory.createCallExpression(
    $expressionOrIdentifier(expression),
    undefined,
    args,
  );

export const $string = (value: string) => ts.factory.createStringLiteral(value);

export const $template = (
  template: TemplateStringsArray,
  ...substitutions: ts.Expression[]
) => {
  return ts.factory.createTemplateExpression(
    ts.factory.createTemplateHead(template.at(0) ?? ""),
    substitutions.map((expression, index, arr) => {
      const isEnd = arr.length - 1 === index;
      return ts.factory.createTemplateSpan(
        expression,
        !isEnd
          ? ts.factory.createTemplateMiddle(template.at(index + 1) ?? "")
          : ts.factory.createTemplateTail(template.at(index + 1) ?? ""),
      );
    }),
  );
};

export const $statement = (expression: ts.Expression) =>
  ts.factory.createExpressionStatement(expression);

export const $doc = (statements: ts.Statement[]) => {
  return ts.factory.createSourceFile(
    statements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.BlockScoped,
  );
};

export const render = (sourceFile: ts.SourceFile) =>
  ts.createPrinter().printFile(sourceFile);
