import { describe, it } from "bun:test";
import { PrepareWorkspace } from "../utils/prepare-workspace.js";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { HTTPLister } from "../../http-router/http-listener.js";
import { defineAction } from "../../actions/actions.js";
import { z } from "zod";

describe("install", async () => {
  it(
    "should install without errors",
    async () => {
      const { $: $work } = await PrepareWorkspace.setup();
      await $work`
      npx actioman install
    `;
    },
    { timeout: 60_000 },
  );
});

describe("install", async () => {
  it(
    "should install remote actions and use them",
    async () => {
      const { $: $work } = await PrepareWorkspace.setup();
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

      await $work`npx actioman add "my action" ${serviceUrl.toString()}`;

      await $work`
      npx actioman install
    `;
    },
    { timeout: 60_000 },
  );
});
