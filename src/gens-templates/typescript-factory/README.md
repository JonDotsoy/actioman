# typescript-factory.ts

**typescript-factory.ts** is a lightweight utility library that simplifies the creation of TypeScript Abstract Syntax Tree (AST) nodes using the `typescript` compiler API. It provides a set of factory functions, prefixed with `$`, that make generating TypeScript code programmatically more intuitive and less verbose.

## Why use typescript-factory.ts?

Working directly with `ts.factory` can be cumbersome and require a deep understanding of the TypeScript AST structure. This library aims to:

- **Improve Readability:** Factory functions like `$const`, `$import`, `$call` clearly express the intent of creating specific TypeScript constructs.
- **Reduce Boilerplate:** Wrap verbose `ts.factory` calls into concise and reusable functions.
- **Enhance Developer Experience:** Make AST manipulation feel more like writing regular TypeScript code.

## Usage

Import the functions you need from `typescript-factory.ts`:

```typescript
import {
  $,
  $const,
  $let,
  $import,
  $asyncArrowFunction,
  $arrowFunction,
  $await,
  $awaitCall,
  $new,
  $call,
  $string,
  $number,
  $bigint,
  $true,
  $false,
  $null,
  $undefined,
  $NaN,
  $template,
  $statement,
  $doc,
  $object,
  $exportDefault,
  $export,
  render,
} from "typescript-factory.ts";
import * * as ts from "typescript";
```

Now you can use the factory functions to create your AST:

### Factory Functions

Here's a breakdown of the available factory functions, categorized for better understanding:

#### Identifiers and Literals

- **`$indentifier(name: string): ts.Identifier`**

  Creates a TypeScript `Identifier` node (e.g., variable name, function name).

  ```typescript
  const identifier = $indentifier("myVariable");
  // Equivalent to: ts.factory.createIdentifier("myVariable");
  ```

- **`$literal(name: string): ts.Identifier`**

  Alias for `$indentifier`. Creates a TypeScript `Identifier` node.

  ```typescript
  const literalIdentifier = $literal("anotherVariable");
  // Equivalent to: $indentifier("anotherVariable");
  ```

- **`$objectProperty(name: string): ts.Identifier | ts.StringLiteral`**

  Creates either a TypeScript `Identifier` or a `StringLiteral` node to be used as an object property key. If the `name` is a valid JavaScript identifier, it creates an `Identifier`; otherwise, it creates a `StringLiteral`.

  ```typescript
  // Creates: propertyName
  const identifierProperty = $objectProperty("propertyName");

  // Creates: "property-name"
  const stringLiteralProperty = $objectProperty("property-name");
  ```

- **`$string(value: string): ts.StringLiteral`**

  Creates a string literal expression (e.g., `"hello"`).

  ```typescript
  // Creates: "hello"
  const stringLiteral = $string("hello");
  ```

- **`$number(value: number): ts.NumericLiteral`**

  Creates a numeric literal expression (e.g., `42`, `3.14`).

  ```typescript
  // Creates: 42
  const numberLiteral = $number(42);
  ```

- **`$bigint(value: string): ts.BigIntLiteral`**

  Creates a bigint literal expression (e.g., `100n`).

  ```typescript
  // Creates: 100n
  const bigintLiteral = $bigint("100");
  ```

- **`$true(): ts.TrueLiteral`**

  Creates a boolean `true` literal expression.

  ```typescript
  // Creates: true
  const trueLiteral = $true();
  ```

- **`$false(): ts.FalseLiteral`**

  Creates a boolean `false` literal expression.

  ```typescript
  // Creates: false
  const falseLiteral = $false();
  ```

- **`$null(): ts.NullLiteral`**

  Creates a `null` literal expression.

  ```typescript
  // Creates: null
  const nullLiteral = $null();
  ```

- **`$undefined(): ts.Identifier`**

  Creates an `undefined` identifier expression (representing the global `undefined`).

  ```typescript
  // Creates: undefined
  const undefinedLiteral = $undefined();
  ```

- **`$NaN(): ts.Identifier`**

  Creates a `NaN` identifier expression (representing the global `NaN`).

  ```typescript
  // Creates: NaN
  const nanLiteral = $NaN();
  ```

- **`$template(template: TemplateStringsArray, ...substitutions: ts.Expression[]): ts.TemplateExpression`**

  Creates a template string literal expression (e.g., `` `Hello, ${name}!` ``). Uses tagged template literal syntax for easier creation.

  ```typescript
  const nameIdentifier = $indentifier("name");

  // Creates: `Hello, ${name}!`;
  const templateString = $template`Hello, ${nameIdentifier}!`;
  ```

#### Variables and Declarations

- **`$const(name: string, initializer?: ts.Expression): ts.VariableStatement`**

  Creates a `const` variable declaration statement.

  ```typescript
  // Creates: const myConstant = 42;
  const constDeclaration = $const("myConstant", $number(42));

  // Creates: const message; (no initializer)
  const constDeclarationNoInitializer = $const("message");
  ```

- **`$let(name: string, initializer?: ts.Expression): ts.VariableStatement`**

  Creates a `let` variable declaration statement.

  ```typescript
  // Creates: let counter = 0;
  const letDeclaration = $let("counter", $number(0));
  ```

- **`$import(modelueName: string, exports?: string[]): ts.ImportDeclaration`**

  Creates an `import` declaration.

  ```typescript
  // Creates: import { Something } from 'module-name';
  const importDeclaration = $import("module-name", ["Something"]);

  // Creates: import { Something, Another } from 'module-name';
  const importDeclarationMultiple = $import("module-name", [
    "Something",
    "Another",
  ]);

  // Creates: import 'module-name'; (no named imports)
  const importDeclarationNoExports = $import("module-name");
  ```

- **`$exportDefault(expression: ts.Expression): ts.ExportAssignment`**

  Creates an `export default` statement.

  ```typescript
  // Creates: export default myVariable;
  const exportDefaultStatement = $exportDefault($indentifier("myVariable"));
  ```

- **`$export(expression: ts.Expression): ts.ExportAssignment`**

  Creates an `export =` statement.

  ```typescript
  // Creates: export = myVariable;
  const exportStatement = $export($indentifier("myVariable"));
  ```

#### Functions and Expressions

- **`$(...props: $propertyProps): ts.Expression`**

  Creates a `PropertyAccessExpression` (e.g., `object.property`) or an `Identifier`.

  - If called with a single string argument, it creates an `Identifier`.
  - If called with multiple arguments (strings or Expressions), it chains them to create property access expressions.

  ```typescript
  // Creates: console
  const consoleIdentifier = $("console");

  // Creates: console.log
  const consoleLog = $("console", "log");

  // Creates: window.location.href
  const windowLocationHref = $("window", "location", "href");

  // You can also mix strings and existing Expressions
  const windowLocation = $("window", $("location")); // Creates: window.location
  ```

- **`$asyncArrowFunction(statements: ts.Statement[] = []): ts.ArrowFunction`**

  Creates an `async` arrow function (e.g., `async () => { ... }`).

  ```typescript
  // Creates: async () => { ... }
  const asyncFunction = $asyncArrowFunction([
    $statement(
      $call($("console", "log"), $string("Hello from async function!")),
    ),
  ]);
  ```

- **`$arrowFunction(body: ts.Expression | ts.Statement[] = []): ts.ArrowFunction`**

  Creates a non-async arrow function (e.g., `() => { ... }` or `() => expression`). The `body` can be either an array of statements (which will be wrapped in a block) or a single expression (for concise body arrow functions).

  ```typescript
  // Creates: () => { console.log("Hello"); }
  const blockArrowFunction = $arrowFunction([
    $statement($call($("console", "log"), $string("Hello"))),
  ]);

  // Creates: () => 42
  const expressionArrowFunction = $arrowFunction($number(42));
  ```

- **`$await(expression: ts.Expression): ts.AwaitExpression`**

  Creates an `await` expression (e.g., `await promise`).

  ```typescript
  // Creates: await somePromise;
  const awaitExpression = $await($call($("fetch"), $string("/api/data")));
  ```

- **`$awaitCall(expression: string | ts.Expression, ...args: ts.Expression[]): ts.AwaitExpression`**

  **Deprecated:** Prefer using `$await($call(...))` for better clarity.

  Creates an `await` expression around a function call. This is a shorthand for `$await($call(expression, ...args))`.

  ```typescript
  // Creates: await fetchData('/api/data');
  const awaitCallExpression = $awaitCall("fetchData", $string("/api/data"));

  // Preferred way using $await and $call:
  const awaitCallExpressionPreferred = $await(
    $call("fetchData", $string("/api/data")),
  );
  ```

- **`$new(expression: string | ts.Expression, ...args: ts.Expression[]): ts.NewExpression`**

  Creates a `new` expression (object instantiation) (e.g., `new MyClass(...)`).

  ```typescript
  // Creates: new MyClass("argument");
  const newExpression = $new("MyClass", $string("argument"));

  // Creates: new URL("/path", baseUrl);
  const baseUrlIdentifier = $indentifier("baseUrl");
  const newUrlExpression = $new("URL", $string("/path"), baseUrlIdentifier);
  ```

- **`$call(expression: string | ts.Expression, ...args: ts.Expression[]): ts.CallExpression`**

  Creates a function call expression (e.g., `myFunction(...)`).

  ```typescript
  // Creates: myFunction("argument1", 123);
  const callExpression = $call(
    "myFunction",
    $string("argument1"),
    $number(123),
  );

  // Creates: console.log("message");
  const consoleLogCall = $call($("console", "log"), $string("message"));
  ```

- **`$object(record: Record<string, ts.Expression>): ts.ObjectLiteralExpression`**

  Creates an object literal expression from a JavaScript record (object). The keys of the record become the property names in the object literal, and the values become the property values (which should be TypeScript Expressions).

  ```typescript
  // Creates: { name: "John", age: 30 }
  const objectLiteral = $object({
    name: $string("John"),
    age: $number(30),
  });
  ```

#### Statements and Documents

- **`$statement(expression: ts.Expression): ts.ExpressionStatement`**

  Creates an expression statement, which wraps an expression to make it a statement. This is often needed to use expressions at the top level of a function body or script.

  ```typescript
  // Creates: console.log("Hello"); (as a statement)
  const statementExpression = $statement(
    $call($("console", "log"), $string("Hello")),
  );
  ```

- **`$doc(statements: ts.Statement[]): ts.SourceFile`**

  Creates a `SourceFile` node, which represents the root of a TypeScript file (document). It takes an array of statements as input and creates a complete AST for a TypeScript file.

  ```typescript
  const importReact = $import("react", ["useState"]);
  const consoleLogStatement = $statement(
    $call($("console", "log"), $string("Hello, World!")),
  );

  const sourceFile = $doc([importReact, consoleLogStatement]);
  ```

#### Rendering

- **`render(sourceFile: ts.SourceFile): string`**

  Renders a `SourceFile` AST node back into a string of TypeScript code. Uses the default TypeScript printer.

  ```typescript
  const sourceCode = render(sourceFile);
  console.log(sourceCode);
  ```

### Example

Let's revisit the example provided in the `typescript-factory.ts` code, now updated to potentially use some of the new functions:

```typescript
import {
  $,
  $const,
  $let, // $let is now imported
  $import,
  $asyncArrowFunction,
  $arrowFunction, // $arrowFunction is now imported
  $await,
  $call,
  $string,
  $template,
  $statement,
  $doc,
  $object, // $object is now imported
  render,
} from "typescript-factory.ts";
import * as ts from "typescript";

// Example props (replace with your actual values)
const props = {
  httpListenerModuleLocation: "@my-org/http-listener",
  configsFactoryModuleLocation: "@my-org/configs-factory",
  configsModuleLocation: "@my-org/configs",
  relativeWorkspaceLocation: "./",
  actionRelativeFileLocation: "./actions/my-action.js",
};

const ast = $doc([
  $import(props.httpListenerModuleLocation, ["HTTPLister"]),
  $import(props.configsFactoryModuleLocation, ["factory"]),
  $import(props.configsModuleLocation, ["Configs"]),
  $const("PORT", $("process", "env", "PORT")),
  $const("HOST", $("process", "env", "HOST")),
  $const(
    "bootstrap",
    $asyncArrowFunction([
      $const(
        "configs",
        $call(
          $("Configs", "fromModule"),
          $await(
            $call(
              $("factory", "findOn"),
              $call(
                $(
                  $new(
                    "URL",
                    $string(props.relativeWorkspaceLocation),
                    $("import", "meta", "url"),
                  ),
                  "toString",
                ),
              ),
              $string("configs"),
            ),
          ),
        ),
      ),
      $const(
        "httpLister",
        $await(
          $call(
            $("HTTPLister", "fromModule"),
            $await($call("import", $string(props.actionRelativeFileLocation))),
            $("configs"),
          ),
        ),
      ),
      $const(
        "url",
        $await($call($("httpLister", "listen"), $("PORT"), $("HOST"))),
      ),
      $statement(
        $call(
          $("console", "log"),
          $template`Server running at ${$call($("url", "toString"))}`,
        ),
      ),
    ]),
  ),
  $statement($call($($call("bootstrap"), "catch"), $("console", "error"))),
]);

const generatedCode = render(ast);
console.log(generatedCode);
```

The explanation remains largely the same as before, but now you have even more tools in `typescript-factory.ts` to create a wider range of TypeScript code constructs with ease.
