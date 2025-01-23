import { afterEach, beforeAll, beforeEach, describe, it } from "bun:test";
import { add } from "./add.js";
import { HTTPLister } from "../../http-router/http-listener.js";
import { defineAction } from "../../actions/actions";
import { z } from "zod";
import { $ } from "../../shell/shell.js";
import * as fs from "fs/promises";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";

beforeEach(async () => {
  await $`
    TEST_DIR=__tests__/sample_project/
    rm -rf $TEST_DIR
    mkdir -p $TEST_DIR
    echo "*" > "__tests__/.gitignore"
  `.cwd(new URL("./", import.meta.url).pathname);
});

describe("add", () => {
  const $work = $.cwd(
    new URL("./__tests__/sample_project/", import.meta.url).pathname,
  );

  beforeEach(async () => {
    await $`
      current_hash=$(cat /tmp/caches/t923051323_1.hash)
      hash=$(find src/ -type f -not -name  "*.spec.*" | sort  | xargs -I {} cat {} | shasum | awk '{{print $1}}')
      echo $hash > /tmp/caches/t923051323_1.hash
      if [ "$current_hash" = "$hash" ]
      then
        rm -f  /tmp/caches/t923051323_1_actioman_module.changed
        exit 0
      fi
      npm pack
      tarfile=$(realpath $(cat package.json | jq -r '"" + .name + "-" + .version + ".tgz"'))
      echo tarfile=$tarfile
      mv $tarfile /tmp/caches/t923051323_1_actioman_module.tgz
      echo "true" > /tmp/caches/t923051323_1_actioman_module.changed
    `;

    await $work`
      mkdir -p /tmp/caches
      if [ -f /tmp/caches/t923051323_1.tgz ]
      then
        tar -xzf /tmp/caches/t923051323_1.tgz
      fi
      if [ ! -f "package.json" ]
      then
        npm init -y
        npm pkg set type=module
      fi
      if [ -f /tmp/caches/t923051323_1_actioman_module.changed ]
      then
        npm add /tmp/caches/t923051323_1_actioman_module.tgz
      fi
      tar -czf /tmp/caches/t923051323_1.tgz .
    `;
  });

  it("should add remote actions and use them", async () => {
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

    await $work`npx actioman add foo ${serviceUrl.toString()}`;

    await $work`
      touch app.js
    `;

    const appScript = (await $work`realpath app.js`.text()).trim();

    fs.writeFile(
      appScript,
      `` +
        `import { actions } from "actioman";\n` +
        `\n` +
        `await actions.foo().hi({name: "juan"});\n` +
        `\n` +
        `\n`,
    );

    await $work`node app.js`;
  });
});
