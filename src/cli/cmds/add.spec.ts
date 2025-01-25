import { describe, it } from "bun:test";
import { HTTPLister } from "../../http-router/http-listener.js";
import { defineAction } from "../../actions/actions";
import { z } from "zod";
import * as fs from "fs/promises";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { PrepareWorkspace } from "../utils/prepare-workspace.js";

describe("add", async () => {
  it(
    "should add remote actions and use them",
    async () => {
      const { $work } = await PrepareWorkspace.setup(import.meta.url);
      await using cleanupTasks = new CleanupTasks();
      cleanupTasks.add(() => httpLocation.close());

      const httpLocation = HTTPLister.fromModule({
        hi: defineAction({
          input: z.object({ name: z.string() }),
          output: z.string(),
          handler: async ({ name }) => `hello ${name}!`,
        }),
      });
      const serviceUrl = await httpLocation.listen();

      await $work`npx actioman add foo ${serviceUrl.toString()}`;
      await $work`npx actioman add taz ${serviceUrl.toString()}`;

      await $work`
      touch app.js
    `;

      const appScript = (await $work`realpath app.js`.text()).trim();

      fs.writeFile(
        appScript,
        `` +
          `import { actions } from "actioman";\n` +
          `\n` +
          `await actions.foo().hi({name: "juan"});\n` +
          `\n` +
          `\n`,
      );

      await $work`node app.js`;
    },
    { timeout: 60_000 },
  );
});
