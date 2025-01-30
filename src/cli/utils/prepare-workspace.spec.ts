import { describe, it } from "bun:test";
import { PrepareWorkspace } from "./prepare-workspace";

describe("", () => {
  it(
    "",
    async () => {
      const { $ } = await PrepareWorkspace.setup();

      await $`pwd`;
    },
    { timeout: 60_000 },
  );
});
