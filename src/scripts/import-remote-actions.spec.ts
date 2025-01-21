import { afterEach, beforeAll, beforeEach, describe, it } from "bun:test";
import { $ } from "../shell/shell";
import { importRemoteActions } from "./import-remote-actions";
import { HTTPLister } from "../http-router/http-listener";
import { defineAction } from "../actions/actions";
import { set, z } from "zod";

describe("import-remote-actions", () => {
  const cleanupTasks = new Set<() => any>();

  afterEach(async () => {
    for (const cleanupTask of cleanupTasks) await cleanupTask();
    cleanupTasks.clear();
  });

  beforeAll(async () => {
    await $`
      rm -rf __tests__/tmp/
      echo "*" > __tests__/.gitignore
      mkdir -p __tests__/tmp/
      mkdir -p __tests__/tmp/node_modules/actioman/lib/esm/share-actions/
      mkdir -p __tests__/tmp/node_modules/actioman/lib/esm/actions-target/
      echo 'export * from "../../../../../../../../actions-target/actions-target.js";' > __tests__/tmp/node_modules/actioman/lib/esm/actions-target/actions-target.js
      echo "export const shareActions = {};" > __tests__/tmp/node_modules/actioman/lib/esm/share-actions/share-actions.js
    `.cwd(new URL("./", import.meta.url).pathname);
  });

  it("imports remote actions", async () => {
    const httpLister = HTTPLister.fromModule({
      hi: defineAction({
        input: z.object({ name: z.string() }),
        handler: async ({ name }) => `Hello, ${name}!`,
      }),
    });
    cleanupTasks.add(() => httpLister.close());

    const server = await httpLister.listen(0);

    await importRemoteActions(
      server,
      "1.- my actions 1",
      new URL("./__tests__/tmp/", import.meta.url).pathname,
    );
  });
});
