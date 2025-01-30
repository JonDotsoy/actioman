import { describe, expect, it } from "bun:test";
import { PrepareWorkspace } from "../utils/prepare-workspace";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";

describe("serve", () => {
  it(
    "should start a server and return 404 if the requested resource is not found",
    async () => {
      const cleanupTasks = new CleanupTasks();
      cleanupTasks.add(() => subProcess.close());
      const { $ } = await PrepareWorkspace.setup();

      await $`
        npm pkg set type=module
        echo "export const hi = () => 'hola';" > app.js
      `;

      const subProcess = $`
        npx actioman serve app.js
      `.background();

      const serviceUrl = await new Promise<string>((resolve) => {
        subProcess.stdout.pipeTo(
          new WritableStream({
            write: (buff) => {
              const url = /Server running at (?<url>.+)\n/.exec(
                new TextDecoder().decode(buff),
              )?.groups?.url;
              if (url) resolve(url);
            },
          }),
        );
      });

      const res = await fetch(new URL(serviceUrl));

      expect(res.status).toEqual(404);
    },
    {
      timeout: 60_000,
    },
  );

  it(
    "should start a server in the given port",
    async () => {
      const cleanupTasks = new CleanupTasks();
      cleanupTasks.add(() => subProcess.close());
      const { $ } = await PrepareWorkspace.setup();

      await $`
        npm pkg set type=module
        echo "export const hi = () => 'hola';" > app.js
      `;

      const subProcess = $`
        npx actioman serve app.js --port 33380
      `.background();

      const serviceUrl = await new Promise<string>((resolve) => {
        subProcess.stdout.pipeTo(
          new WritableStream({
            write: (buff) => {
              const url = /Server running at (?<url>.+)\n/.exec(
                new TextDecoder().decode(buff),
              )?.groups?.url;
              if (url) resolve(url);
            },
          }),
        );
      });

      expect(new URL(serviceUrl).port).toEqual(`${33380}`);
    },
    {
      timeout: 60_000,
    },
  );
});
