# 🏹 actioman

Share functions with other js clients. Call backend functions with type-safety.

- validate json input using zod validation

## Basic usage

Define a server schema with all functions. This file is called by `actioman`.

```ts
import { defineAction } from "actioman";

export const myAction = defineAction({
  /* ... */
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

call `actioman <file.ts>` to deploy an http server.

```shell
$ npx actioman <file.ts>
# actions listen on http://localhost:3000
```

On your client you can call `actioman import ` to add new source.

```shell
$ npx actioman add foo http://localhost:3000
```

On your javascript function call `actioman` module and invoke the `myAction` function.

```ts
import { foo } from "actioman";

const { error, data } = await foo.myAction();
```
