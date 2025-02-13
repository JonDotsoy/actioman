import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { describe, expect, it } from "bun:test";
import { HTTP2Lister } from "./http2-listener.js";
import * as http2 from "http2";
import { DEFAULT_CERT } from "./DEFAULT_CERT.js";
import { DEFAULT_KEY } from "./DEFAULT_KEY.js";

describe("async HTTP2Lister", () => {
  it("should return 200 for /__actions", async () => {
    await using cleanupTasks = new CleanupTasks();

    const http2Lister = HTTP2Lister.fromModule(
      {
        hi: () => "ok",
      },
      {
        server: {
          ssl: {
            key: DEFAULT_KEY,
            cert: DEFAULT_CERT,
          },
        },
      },
    );
    cleanupTasks.add(() => http2Lister.close());

    const url = await http2Lister.listen();

    const client = http2.connect(url, { ca: DEFAULT_CERT });
    cleanupTasks.add(() => client.close());

    const { status, body } = await new Promise<{ body: any; status: number }>(
      (resolve, reject) => {
        const data: number[] = [];
        let status: any;

        client
          .request({
            [http2.constants.HTTP2_HEADER_PATH]: "/__actions",
            [http2.constants.HTTP2_HEADER_METHOD]: "GET",
          })
          .addListener("error", (err) => reject(err))
          .addListener("response", (headers) => {
            status = headers[http2.constants.HTTP2_HEADER_STATUS];
          })
          .addListener("data", (d) => data.push(...d))
          .addListener("close", () => {
            resolve({
              status,
              body: new TextDecoder().decode(new Uint8Array(data)),
            });
          });
      },
    );

    expect(status).toEqual(200);
    expect(body).toMatchSnapshot();
  });

  it("should return 200 for /__actions without ssl", async () => {
    await using cleanupTasks = new CleanupTasks();

    const http2Lister = HTTP2Lister.fromModule({
      hi: () => "ok",
    });
    cleanupTasks.add(() => http2Lister.close());

    const url = await http2Lister.listen();

    const client = http2.connect(url);
    cleanupTasks.add(() => client.close());

    const { status, body } = await new Promise<{ body: any; status: number }>(
      (resolve, reject) => {
        const data: number[] = [];
        let status: any;

        client
          .request({
            [http2.constants.HTTP2_HEADER_PATH]: "/__actions",
            [http2.constants.HTTP2_HEADER_METHOD]: "GET",
          })
          .addListener("error", (err) => reject(err))
          .addListener("response", (headers) => {
            status = headers[http2.constants.HTTP2_HEADER_STATUS];
          })
          .addListener("data", (d) => data.push(...d))
          .addListener("close", () => {
            resolve({
              status,
              body: new TextDecoder().decode(new Uint8Array(data)),
            });
          });
      },
    );

    expect(status).toEqual(200);
    expect(body).toMatchSnapshot();
  });
});
