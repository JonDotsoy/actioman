import { describe, expect, it } from "bun:test";
import { $ } from "../shell/shell";
import { makeServerScript } from "./make-server-script.js";
import * as fs from "fs/promises";

describe("makeServerScript", () => {
  it("generates bootstrap script", async () => {
    const WORKSPACE_PATH = "./__tests__/__workspaces__/make-server-script/";

    await $`
      rm -rf $WORKSPACE_PATH
      mkdir -p $WORKSPACE_PATH
      echo "*" > $WORKSPACE_PATH/.gitignore
    `
      .cwd(new URL("./", import.meta.url).pathname)
      .appendEnvs({ WORKSPACE_PATH });

    await $`
      mkdir -p node_modules/actioman/lib/esm/http-router/
      touch node_modules/actioman/lib/esm/http-router/http-listener.js
      touch actions.js
    `.cwd(new URL(WORKSPACE_PATH, import.meta.url).pathname);

    const actionsPathRaw = await $`realpath actions.js`
      .cwd(new URL(WORKSPACE_PATH, import.meta.url).pathname)
      .text();
    const actionsPath = actionsPathRaw.trim();

    const res = await makeServerScript(
      new URL(WORKSPACE_PATH, import.meta.url).pathname,
      actionsPath,
    );

    expect(res.bootstrapLocation).toBeInstanceOf(URL);
    expect(
      await fs.readFile(new URL(res.bootstrapLocation), "utf-8"),
    ).toMatchSnapshot();
  });
});
