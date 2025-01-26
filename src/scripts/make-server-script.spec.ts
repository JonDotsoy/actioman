import { describe, it } from "bun:test";
import { $ } from "../shell/shell";
import { makeServerScript } from "./make-server-script.js";

const prepareWorkspace = async (mainFile: string) => {
  await $`
    TESTS_DIR=./__tests__/make-server-script/
    mkdir -p $TESTS_DIR
    TESTS_DIR=$(realpath $TESTS_DIR)
    echo "*" > "$TESTS_DIR/.gitignore"
  `.cwd(new URL("./", mainFile).pathname);
  const testsDir = await $`realpath $TESTS_DIR`.text();
  return testsDir.trim();
};

describe("", () => {
  it("", async () => {
    await prepareWorkspace(import.meta.url);

    await makeServerScript("");
  });
});
