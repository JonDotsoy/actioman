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
  $import,
  $asyncArrowFunction,
  $await,
  $call,
  $string,
  $template,
  $statement,
  $doc,
  render,
} from "typescript-factory.ts";
import * as ts from "typescript";
```

Now you can use the factory functions to create your AST:

### Factory Functions

Here's a breakdown of the available factory functions:

- **`$indentifier(name: string): ts.Identifier`**

  Creates a TypeScript `Identifier` node.

  ```typescript
  const identifier = $indentifier("myVariable");
  // Equivalent to: ts.factory.createIdentifier("myVariable");
  ```

- **`$(...props: $propertyProps): ts.Expression`**

  Creates a `PropertyAccessExpression` or an `Identifier`.

  - If called with a single string argument, it creates an `Identifier`.
  - If called with multiple arguments (strings or Expressions), it chains them to create property access expressions (e.g., `object.property1.property2`).

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

- **`$const(name: string, initializer?: ts.Expression): ts.VariableStatement`**

  Creates a `const` variable declaration statement.

  ```typescript
  // Creates: const myConstant = 42;
  const constDeclaration = $const(
    "myConstant",
    ts.factory.createNumericLiteral(42),
  );

  // Creates: const message; (no initializer)
  const constDeclarationNoInitializer = $const("message");
  ```

- **`$let(name: string, initializer?: ts.Expression): ts.VariableStatement`**

  Creates a `let` variable declaration statement.

  ```typescript
  // Creates: let counter = 0;
  const letDeclaration = $let("counter", ts.factory.createNumericLiteral(0));
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

- **`$asyncArrowFunction(statements: ts.Statement[] = []): ts.ArrowFunction`**

  Creates an `async` arrow function.

  ```typescript
  // Creates: async () => { ... }
  const asyncFunction = $asyncArrowFunction([
    $statement(
      $call($("console", "log"), $string("Hello from async function!")),
    ),
  ]);
  ```

- **`$await(expression: ts.Expression): ts.AwaitExpression`**

  Creates an `await` expression.

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

  Creates a `new` expression (object instantiation).

  ```typescript
  // Creates: new MyClass("argument");
  const newExpression = $new("MyClass", $string("argument"));

  // Creates: new URL("/path", baseUrl);
  const baseUrlIdentifier = $indentifier("baseUrl");
  const newUrlExpression = $new("URL", $string("/path"), baseUrlIdentifier);
  ```

- **`$call(expression: string | ts.Expression, ...args: ts.Expression[]): ts.CallExpression`**

  Creates a function call expression.

  ```typescript
  // Creates: myFunction("argument1", 123);
  const callExpression = $call(
    "myFunction",
    $string("argument1"),
    ts.factory.createNumericLiteral(123),
  );

  // Creates: console.log("message");
  const consoleLogCall = $call($("console", "log"), $string("message"));
  ```

- **`$string(value: string): ts.StringLiteral`**

  Creates a string literal expression.

  ```typescript
  // Creates: "hello"
  const stringLiteral = $string("hello");
  ```

- **`$template(template: TemplateStringsArray, ...substitutions: ts.Expression[]): ts.TemplateExpression`**

  Creates a template string literal expression. Uses tagged template literal syntax for easier creation.

  ```typescript
  const nameIdentifier = $indentifier("name");

  // Creates: `Hello, ${name}!`;
  const templateString = $template`Hello, ${nameIdentifier}!`;
  ```

- **`$statement(expression: ts.Expression): ts.ExpressionStatement`**

  Creates an expression statement, which wraps an expression to make it a statement.

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

- **`render(sourceFile: ts.SourceFile): string`**

  Renders a `SourceFile` AST node back into a string of TypeScript code. Uses the default TypeScript printer.

  ```typescript
  const sourceCode = render(sourceFile);
  console.log(sourceCode);
  ```

### Example

Let's look at the example provided in the `typescript-factory.ts` code:

```typescript
import {
  $,
  $const,
  $import,
  $asyncArrowFunction,
  $await,
  $call,
  $string,
  $template,
  $statement,
  $doc,
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

**Explanation:**

This example generates TypeScript code that bootstraps a server. Let's break it down:

1.  **Imports:**

    - `$import(props.httpListenerModuleLocation, ["HTTPLister"])`: Imports `HTTPLister` from the module specified in `props.httpListenerModuleLocation`.
    - Similarly, imports `factory` and `Configs` from their respective module locations.

2.  **Environment Variables as Constants:**

    - `$const("PORT", $("process", "env", "PORT"))`: Creates `const PORT = process.env.PORT;`.
    - `$const("HOST", $("process", "env", "HOST"))`: Creates `const HOST = process.env.HOST;`.
      - Here, `$("process", "env", "PORT")` uses the `$` function to create the property access expression `process.env.PORT`.

3.  **`bootstrap` Async Arrow Function:**

    - `$const("bootstrap", $asyncArrowFunction([...]))`: Declares a constant named `bootstrap` and initializes it with an async arrow function.
    - **Inside `bootstrap`:**
      - **`configs` Constant:**
        - Fetches configurations asynchronously using modules and factories, demonstrating nested `$call`, `$await`, and `$new` functions to create complex expressions.
      - **`httpLister` Constant:**
        - Creates an HTTP listener instance asynchronously, again using `$await` and `$call` with module imports.
      - **`url` Constant:**
        - Calls the `listen` method on `httpLister` to start the server, passing `PORT` and `HOST`.
      - **`console.log` Statement:**
        - Logs a message to the console using a template literal `$template` to display the server URL.

4.  **Bootstrap Execution and Error Handling:**

    - `$statement($call($($call("bootstrap"), "catch"), $("console", "error")))`: Calls the `bootstrap` function and attaches a `catch` handler to log any errors to the console. This demonstrates chaining function calls using `$`.

5.  **Rendering:**
    - `render(ast)`: Converts the generated AST (`ast`) into a string of TypeScript code.
    - `console.log(generatedCode)`: Prints the generated code to the console.

This example showcases how `typescript-factory.ts` can be used to construct complex TypeScript code programmatically in a more readable and manageable way.
