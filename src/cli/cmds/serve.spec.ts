import { describe, expect, it } from "bun:test";
import { PrepareWorkspace } from "../utils/prepare-workspace";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { DEFAULT_CERT } from "../../http-router/DEFAULT_CERT";

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
    "should start a server with http2 and return 404 if the requested resource is not found",
    async () => {
      const cleanupTasks = new CleanupTasks();
      cleanupTasks.add(() => subProcess.close());
      const { $ } = await PrepareWorkspace.setup();

      await $`
        npm pkg set type=module
        echo "export const hi = () => 'hola';" > app.js
      `;

      const subProcess = $`
        npx actioman serve app.js --http2
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

      const http2 = await import("http2");
      const conn = await new Promise<import("http2").ClientHttp2Session>(
        async (resolve, reject) => {
          const conn = http2
            .connect(serviceUrl, {
              ca: DEFAULT_CERT,
            })
            .addListener("error", (err) => reject(conn))
            .addListener("connect", () => resolve(conn));
        },
      );
      const res = await new Promise<{
        req: import("http2").ClientHttp2Stream;
        res: import("http2").IncomingHttpHeaders &
          import("http2").IncomingHttpStatusHeader;
        body: Uint8Array;
      }>((resolve, reject) => {
        const req = conn
          .request({
            [http2.constants.HTTP2_HEADER_METHOD]: "GET",
            [http2.constants.HTTP2_HEADER_PATH]: "/",
          })
          .addListener("error", (err) => reject(err))
          .addListener("response", (res) => {
            const body: number[] = [];
            req.addListener("data", (chunk) => body.push(...chunk));
            req.addListener("end", () => {
              resolve({
                req,
                res,
                body: new Uint8Array(body),
              });
            });
          });
      });

      expect<any>(res.res[http2.constants.HTTP2_HEADER_STATUS]).toEqual(404);
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
