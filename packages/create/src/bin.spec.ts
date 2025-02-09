import * as bun from "bun";
import { beforeAll, describe, expect, it } from "bun:test";

describe("create script", () => {
  const workspace = new URL("./__workspaces__/", import.meta.url);
  const binsWorkspace = new URL("./.bin/", workspace);
  const testWorkspace = new URL("./test_1/", workspace);
  const envs = {
    ...process.env,
    workspace: workspace.pathname,
    test_workspace: testWorkspace.pathname,
    bins_workspace: binsWorkspace.pathname,
    ENGINE_BIN: process.execPath,
    BIN_SCRIPT: new URL("./bin.ts", import.meta.url).pathname,
    bin: `${binsWorkspace.pathname}/bin`,
  };

  const $ = (template: TemplateStringsArray, ...args: string[]) =>
    bun
      .$(template, ...args)
      .cwd(testWorkspace.pathname)
      .env(envs);

  beforeAll(async () => {
    await bun.$`
      rm -rf $workspace
      mkdir -p $workspace
      rm -rf $test_workspace
      mkdir -p $test_workspace
      rm -rf $bins_workspace
      mkdir -p $bins_workspace
      echo "*" > $workspace/.gitignore
      echo "#!/bin/sh" > $bins_workspace/bin
      echo "" >> $bins_workspace/bin
      echo "$ENGINE_BIN $BIN_SCRIPT $@" >> $bins_workspace/bin
      chmod +x $bins_workspace/bin
    `.env(envs);

    await $`
      echo '{}' | jq -r '.type="module" | .' > package.json
    `;
  });

  it("should ...", async () => {
    await $`
      $bin
    `;
  });
});
