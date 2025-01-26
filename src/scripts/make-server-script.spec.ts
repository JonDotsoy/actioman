import { describe, it } from "bun:test";
import { $ } from "../shell/shell";
import { makeServerScript } from "./make-server-script.js";
import { PrepareWorkspace } from "../cli/utils/prepare-workspace.js";

describe("", () => {
  it.skip("", async () => {
    const {} = await PrepareWorkspace.setup();

    await makeServerScript("");
  });
});
