import { afterEach, describe, it } from "bun:test";
import { PrepareWorkspace } from "./prepare-workspace";
import { cleanHistoryPids } from "../../shell/shell";
import * as YAML from "yaml";
import * as fs from "fs";

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

    it(
      "should make a prometheus and compose file",
      async () => {
        const { $, workspaceDir } = await PrepareWorkspace.setup({
          name: "simple_actions_server_with_prometheus",
          // verbose: true,
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

        const actiomanConfigFile = new URL("actioman.config.js", workspaceDir);
        fs.writeFileSync(
          actiomanConfigFile,
          "" +
            'import { metrics } from "actioman/integrations/metrics"\n' +
            "\n" +
            "export default {\n" +
            "    integrations: [\n" +
            "        metrics()\n" +
            "    ]\n" +
            "}\n",
        );

        const prometheusFile = new URL("prometheus.yml", workspaceDir);
        fs.writeFileSync(
          prometheusFile,
          YAML.stringify({
            scrape_configs: [
              {
                job_name: "actioman",
                metrics_path: "/metrics",
                scheme: "http",
                scrape_interval: "5s",
                scrape_timeout: "5s",
                static_configs: [
                  {
                    targets: ["host.docker.internal:6565"],
                  },
                ],
              },
            ],
          }),
        );

        const composeFile = new URL("compose.yml", workspaceDir);
        fs.writeFileSync(
          composeFile,
          YAML.stringify({
            services: {
              prom: {
                image: "prom/prometheus",
                develop: {
                  watch: [
                    {
                      path: "./prometheus.yml",
                      action: "restart",
                    },
                  ],
                },
                volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml"],
                ports: ["9090:9090"],
                network_mode: "bridge",
                extra_hosts: ["host.docker.internal:host-gateway"],
              },
            },
          }),
        );

        console.log(``);
        console.log(``);
        console.log(`## Workspace`);
        console.log(`${workspaceDir.pathname}`);
        console.log(``);
        console.log(``);
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
