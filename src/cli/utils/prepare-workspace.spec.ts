import { afterEach, describe, it } from "bun:test";
import { PrepareWorkspace } from "./prepare-workspace";
import { cleanHistoryPids } from "../../shell/shell";

describe("PrepareWorkspace", () => {
  afterEach(() => cleanHistoryPids());

  it(
    "should setup a workspace",
    async () => {
      const { $ } = await PrepareWorkspace.setup({ verbose: true });

      await $`pwd`;
    },
    { timeout: 60_000 },
  );
});
