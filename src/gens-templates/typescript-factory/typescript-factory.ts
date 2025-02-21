import * as ts from "typescript";

const $expressionOrIdentifier = (value: string | ts.Expression) =>
  typeof value === "string" ? $indentifier(value) : value;

export const $indentifier = (name: string) => ts.factory.createIdentifier(name);
export const $objectProperty = (name: string) => {
  if (/^\w+$/.test(name)) return $indentifier(name);
  return ts.factory.createStringLiteral(name);
};

/** Alias of {@link $indentifier} */
export const $literal = $indentifier;

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

export const $arrowFunction = (body: ts.Expression | ts.Statement[] = []) => {
  return ts.factory.createArrowFunction(
    [],
    undefined,
    [],
    undefined,
    undefined,
    Array.isArray(body) ? ts.factory.createBlock(body, true) : body,
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

export const $string = (value: string): ts.Expression =>
  ts.factory.createStringLiteral(value);
export const $true = (): ts.Expression => ts.factory.createTrue();
export const $false = (): ts.Expression => ts.factory.createFalse();
export const $number = (value: number): ts.Expression =>
  ts.factory.createNumericLiteral(value);
export const $bigint = (value: string): ts.Expression =>
  ts.factory.createBigIntLiteral(value);
export const $null = (value: string): ts.Expression => ts.factory.createNull();
export const $undefined = (): ts.Expression =>
  ts.factory.createIdentifier("undefined");
export const $NaN = (): ts.Expression => ts.factory.createIdentifier("NaN");

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

export const $object = (record: Record<string, ts.Expression>) => {
  return ts.factory.createObjectLiteralExpression(
    Object.entries(record).map(([key, value]) =>
      ts.factory.createPropertyAssignment($objectProperty(key), value),
    ),
    true,
  );
};

$object.$property = $objectProperty;

export const $exportDefault = (expression: ts.Expression) =>
  ts.factory.createExportDefault(expression);

export const $export = (expression: ts.Expression) =>
  ts.factory.createExportAssignment([], undefined, expression);

export const render = (sourceFile: ts.SourceFile) =>
  ts.createPrinter().printFile(sourceFile);
