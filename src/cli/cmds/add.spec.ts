import { afterEach, describe, expect, it, mock } from "bun:test";
import { HTTPLister } from "../../http-router/http-listener.js";
import { defineAction } from "../../actions/actions";
import { z } from "zod";
import * as fs from "fs/promises";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { PrepareWorkspace } from "../utils/prepare-workspace.js";
import { cleanHistoryPids } from "../../shell/shell.js";

let port = 9080;

describe("add", async () => {
  afterEach(() => cleanHistoryPids());

  it(
    "should add remote actions and use them",
    async () => {
      const { $ } = await PrepareWorkspace.setup();
      await using cleanupTasks = new CleanupTasks();
      cleanupTasks.add(() => httpLocation.close());

      const fn = mock((d: string) => d);

      const httpLocation = HTTPLister.fromModule({
        hi: defineAction({
          input: z.object({ name: z.string() }),
          output: z.string(),
          handler: async ({ name }) => fn(`hello ${name}!`),
        }),
        sum: ({ a, b }: { a: number; b: number }) => 3,
        add: ({ a, b }: { a: number; b: number }) => 3,
      });
      const serviceUrl = await httpLocation.listen(port++);

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
          `await actions.foo().hi({name: "carl"});\n` +
          `\n` +
          `\n`,
      );

      await $`node app.js`;

      expect(fn).toHaveBeenCalledWith("hello juan!");
      expect(fn).toHaveBeenCalledWith("hello carl!");
      expect(fn).toHaveBeenCalledTimes(2);
    },
    { timeout: 60_000 },
  );
});
