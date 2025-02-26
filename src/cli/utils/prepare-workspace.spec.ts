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

  describe("Make server and client actions", () => {
    /** Make server actions with f1 and f2 */
    it(
      "should make server actions with f1 and f2",
      async () => {
        const { $ } = await PrepareWorkspace.setup({
          name: "simple_actions_server",
          verbose: true,
        });

        await $`
          set -e

          npm pkg set type=module

          echo "export async function f1() { return 'ok' }" >> actions.ts
          echo "export async function * f2() { yield 'ok' }" >> actions.ts

          echo "#!/bin/sh" > serve.sh
          echo "## bootstrap" >> serve.sh
          echo "bunx actioman serve actions.ts --port 6565 --host ::" >> serve.sh
        `;
      },
      { timeout: 60_000 },
    );

    /** Make client actions with actioman add */
    it(
      "should make client actions with actioman add",
      async () => {
        const { $ } = await PrepareWorkspace.setup({
          name: "simple_actions_client",
          verbose: true,
        });

        await $`
          set -e

          npm pkg set type=module

          echo 'import { actions } from "actioman";' >> client.ts
          echo '' >> client.ts
          echo 'console.log(actions);' >> client.ts

          echo '#!/bin/sh' >> import.sh
          echo 'bunx actioman add foo "http://localhost:6565"' >> import.sh

        `;
      },
      { timeout: 60_000 },
    );
  });
});
