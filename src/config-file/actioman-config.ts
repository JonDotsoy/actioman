import { get } from "@jondotsoy/utils-js/get";
import { visit } from "@jondotsoy/utils-js/visit";
import * as fs from "fs/promises";
import * as ts from "typescript";

const getArrayNodes = (obj: unknown, ...paths: string[]) => {
  return (get.array(obj, ...paths) as any[]) ?? [];
};

export class ActiomanConfigDocument {
  private constructor(
    readonly location: URL,
    readonly payload: Uint8Array,
    readonly sourceFile: ts.SourceFile,
  ) {}

  queryExportDefaultNode() {
    throw new Error("Method not implemented.");
  }

  visitFirst(test: (node: ts.Node) => boolean) {
    for (const node of visit(this.sourceFile, test)) {
      return node as ts.Node;
    }
    return null;
  }

  selectFirstByKind(kind: number) {
    return this.visitFirst((node) => get.number(node, "kind") === kind);
  }

  selectSourceFileExportAssignment() {
    if (this.sourceFile.kind === ts.SyntaxKind.SourceFile) {
      const exportDefaultNode = getArrayNodes(
        this.sourceFile,
        "statements",
      )?.find((node) => node.kind === ts.SyntaxKind.ExportAssignment);
      return exportDefaultNode ?? null;
    }

    return null;
  }

  selectVariableStatemant(indicator: string) {
    const statements: ts.Node[] = getArrayNodes(this.sourceFile, "statements");

    for (const statement of statements) {
      if (statement.kind === ts.SyntaxKind.VariableStatement) {
        const declarations = getArrayNodes(
          statement,
          "declarationList",
          "declarations",
        );
        for (const declaration of declarations) {
          if (
            get.number(declaration, "kind") ===
              ts.SyntaxKind.VariableDeclaration &&
            get.number(declaration, "name", "kind") ===
              ts.SyntaxKind.Identifier &&
            get.string(declaration, "name", "escapedText") === indicator &&
            get.number(declaration, "initializer", "kind") ===
              ts.SyntaxKind.ObjectLiteralExpression
          ) {
            return get(declaration, "initializer") as ts.Node | null;
          }
        }
      }
    }

    return null;
  }

  selectSettingsObject(): ts.Node | null {
    const exportDefaultNode = this.selectSourceFileExportAssignment();

    if (
      get.number(exportDefaultNode, "expression", "kind") ===
      ts.SyntaxKind.ObjectLiteralExpression
    ) {
      return (get.record(exportDefaultNode, "expression") as ts.Node) ?? null;
    }

    if (
      get.number(exportDefaultNode, "expression", "kind") ===
      ts.SyntaxKind.Identifier
    ) {
      const ref = get.string(exportDefaultNode, "expression", "escapedText");

      if (ref) return this.selectVariableStatemant(ref);
    }

    return null;
  }

  selectExpressionServerSettingsObjectOrCreate() {
    const node = this.selectSettingsObject();

    const serverNode =
      (get
        .array(node, "properties")
        ?.find(
          (node) =>
            get.number(node, "kind") === ts.SyntaxKind.PropertyAssignment &&
            get.string(node, "name", "escapedText") === "server",
        ) as ts.PropertyAssignment | undefined) ?? null;

    if (serverNode === null) {
      const newPropertyAssigment = ts.factory.createPropertyAssignment(
        "server",
        ts.factory.createObjectLiteralExpression([]),
      );
      get.array(node, "properties")?.push(newPropertyAssigment);

      return newPropertyAssigment.initializer;
    }

    return serverNode.initializer;
  }

  selectServerSettingsObjectOrCreate() {
    const expression = this.selectExpressionServerSettingsObjectOrCreate();
    if (expression.kind === ts.SyntaxKind.ObjectLiteralExpression)
      return expression as ts.ObjectLiteralExpression;
    return null;
  }

  selectSSLServerSettingsObjectOrCreate() {
    const expression = this.selectExpressionServerSettingsObjectOrCreate();
    const objectLiteralExpression =
      expression.kind === ts.SyntaxKind.ObjectLiteralExpression
        ? (expression as ts.ObjectLiteralExpression)
        : null;

    const sslField =
      (objectLiteralExpression?.properties.find(
        (node) =>
          get.string(node, "name", "escapedText") === "ssl" &&
          get.number(node, "initializer", "kind") ===
            ts.SyntaxKind.ObjectLiteralExpression,
      ) as ts.PropertyAssignment | undefined) ?? null;

    if (sslField === null) {
      const newPropertyAssigment = ts.factory.createPropertyAssignment(
        "ssl",
        ts.factory.createObjectLiteralExpression([]),
      );
      get
        .array(objectLiteralExpression, "properties")
        ?.push(newPropertyAssigment);
      return newPropertyAssigment.initializer;
    }

    return sslField.initializer;
  }

  toString() {
    return ts
      .createPrinter()
      .printNode(ts.EmitHint.Unspecified, this.sourceFile, this.sourceFile);
  }

  static async fromFile(url: URL) {
    const payload = new Uint8Array(await fs.readFile(url));
    const sourceFile = ts.createSourceFile(
      url.pathname,
      new TextDecoder().decode(payload),
      ts.ScriptTarget.Latest,
    );
    return new ActiomanConfigDocument(url, payload, sourceFile);
  }

  static async fromSourceFile(url: URL, payload: Uint8Array) {
    const sourceFile = ts.createSourceFile(
      url.pathname,
      new TextDecoder().decode(payload),
      ts.ScriptTarget.Latest,
    );
    return new ActiomanConfigDocument(url, payload, sourceFile);
  }
}

export class ActiomanConfig {
  private constructor(
    readonly actiomanConfigDocument: ActiomanConfigDocument,
  ) {}

  setServerHost(host: string) {
    const node =
      this.actiomanConfigDocument.selectServerSettingsObjectOrCreate();

    get
      .array(node, "properties")
      ?.push(
        ts.factory.createPropertyAssignment(
          ts.factory.createIdentifier("host"),
          ts.factory.createStringLiteral(host),
        ),
      );
  }

  setServerPort(port: number) {
    const node =
      this.actiomanConfigDocument.selectServerSettingsObjectOrCreate();

    get
      .array(node, "properties")
      ?.push(
        ts.factory.createPropertyAssignment(
          ts.factory.createIdentifier("port"),
          ts.factory.createNumericLiteral(port),
        ),
      );
  }

  setServerSSLKey(key: string) {
    const node =
      this.actiomanConfigDocument.selectSSLServerSettingsObjectOrCreate();

    get
      .array(node, "properties")
      ?.push(
        ts.factory.createPropertyAssignment(
          ts.factory.createIdentifier("key"),
          ts.factory.createStringLiteral(key),
        ),
      );
  }

  setServerSSLCert(cert: string) {
    const node =
      this.actiomanConfigDocument.selectSSLServerSettingsObjectOrCreate();

    get
      .array(node, "properties")
      ?.push(
        ts.factory.createPropertyAssignment(
          ts.factory.createIdentifier("cert"),
          ts.factory.createStringLiteral(cert),
        ),
      );
  }

  toString() {
    return this.actiomanConfigDocument.toString();
  }

  static async fromFile(url: URL) {
    return new ActiomanConfig(await ActiomanConfigDocument.fromFile(url));
  }

  static async fromSourceFile(url: URL, payload: Uint8Array) {
    return new ActiomanConfig(
      await ActiomanConfigDocument.fromSourceFile(url, payload),
    );
  }
}
