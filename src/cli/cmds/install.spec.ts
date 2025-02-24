import { afterEach, describe, it } from "bun:test";
import { PrepareWorkspace } from "../utils/prepare-workspace.js";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { HTTPLister } from "../../http-router/http-listener.js";
import { defineAction } from "../../actions/actions.js";
import { z } from "zod";
import { cleanHistoryPids } from "../../shell/shell.js";

let port = 10080;

describe("install", async () => {
  afterEach(() => cleanHistoryPids());

  it(
    "should install without errors",
    async () => {
      const { $: $work } = await PrepareWorkspace.setup({ name: "install" });
      await $work`
      npx actioman install
    `;
    },
    { timeout: 60_000 },
  );
});

describe("install", async () => {
  afterEach(() => cleanHistoryPids());

  it(
    "should install remote actions and use them",
    async () => {
      console.log("lo");
      const { $: $work } = await PrepareWorkspace.setup({ name: "install" });
      await using cleanupTasks = new CleanupTasks();
      cleanupTasks.add(() => httpLocation.close());

      const httpLocation = HTTPLister.fromModule({
        hi: defineAction({
          input: z.object({ name: z.string() }),
          output: z.string(),
          handler: async ({ name }) => `hello ${name}!`,
        }),
      });
      console.log("listening");
      const serviceUrl = await httpLocation.listen(port++);
      console.log("🚀 ~ serviceUrl:", serviceUrl);

      console.log(`npx actioman add "my action" "${serviceUrl.toString()}"`);
      await $work`npx actioman add "my action" "${serviceUrl.toString()}"`;

      await $work`
      npx actioman install
    `;
    },
    { timeout: 60_000 },
  );
});
