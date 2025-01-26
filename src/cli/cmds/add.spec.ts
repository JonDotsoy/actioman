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
      const { $ } = await PrepareWorkspace.setup();
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

      await $`npx actioman add foo ${serviceUrl.toString()}`;
      await $`npx actioman add taz ${serviceUrl.toString()}`;

      await $`
        touch app.js
      `;

      const appScript = (await $`realpath app.js`.text()).trim();

      fs.writeFile(
        appScript,
        `` +
          `import { actions } from "actioman";\n` +
          `\n` +
          `await actions.foo().hi({name: "juan"});\n` +
          `\n` +
          `\n`,
      );

      await $`node app.js`;
    },
    { timeout: 60_000 },
  );
});
