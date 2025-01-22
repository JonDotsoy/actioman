# 🏹 actioman

Share functions with other js clients. Call backend functions with type-safety.

- validate json input/output using zod validation

## Basic usage

Define a server schema with all functions. This file is called by `actioman`.

```ts
// ./actions.js
import { defineAction } from "actioman";
import { z } from "zod";

export const hi = defineAction({
  input: z
    .object({ name: z.string().optional(), metadata: z.record(z.string()) })
    .strict(),
  handler: async ({ name }) => `Hello ${name}`,
});

export const foo = defineAction({
  description: "foo",
  input: z.string(),
  output: z.object({ name: z.string() }).strict(),
  handler: async (input) => ({ name: input }),
});
```

## Setup a http listener

```ts
import { HTTPListener } from "actioman/http-listener";

const httpListener = HTTPListener.fromModule(await import("./actions.js"));

await httpListener.listen();
```

### Using custom router with express

```ts
const app = express();
const port = 3000;

const httpRouter = HTTPRouter.fromModule(await import("./actions.js"));

app.use("/", async (req, res, next) => {
  const ok = await httpRouter.router.requestListener(req, res);
  if (!ok) next();
});

const server = app.listen(port);
```

## Compile actions documents from a URL

```shell
npx actioman add foo http://example.com
```

```ts
const actionsDocument = await ActionsDocument.fromHTTPServer(
  new URL("http://sample.com/"),
);

fs.writeFile("sample-actions.js", actionsDocument.toString());
```

```js
// sample-actions.js
import { z } from "zod";
import { ActionsTarget } from "actioman/actions-target";

const createActionsTarget = () =>
  new ActionsTarget("http://localhost:30321/__actions", {
    hi: {
      description: undefined,
      input: z
        .object({ name: z.string().optional(), metadata: z.record(z.string()) })
        .strict(),
      output: undefined,
    },
    foo: {
      description: "foo",
      input: z.string(),
      output: z.object({ name: z.string() }).strict(),
    },
  });

export default createActionsTarget;
```

## Load actions

```ts
import { actions } from "actioman";

await actions.foo().hi({ name: "John" });
```
