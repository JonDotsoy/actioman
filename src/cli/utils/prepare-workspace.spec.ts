import { describe, it } from "bun:test";
import { PrepareWorkspace } from "./prepare-workspace";

describe("PrepareWorkspace", () => {
  it(
    "should setup a workspace",
    async () => {
      const { $ } = await PrepareWorkspace.setup();

      await $`pwd`;
    },
    { timeout: 60_000 },
  );
});
