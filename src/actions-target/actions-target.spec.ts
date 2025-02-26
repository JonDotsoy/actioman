import { afterAll, beforeAll, expect, it, mock } from "bun:test";
import { ActionsTarget } from "./actions-target";
import { z } from "zod";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { get } from "@jondotsoy/utils-js/get";
import { HTTPLister } from "../http-router/http-listener";
import { expectTypeOf } from "expect-type";
import { HTTP2Lister } from "../http-router/http2-listener";
import { DEFAULT_KEY } from "../http-router/DEFAULT_KEY";
import { DEFAULT_CERT } from "../http-router/DEFAULT_CERT";
import * as http2 from "http2";

let port = 6767;

it("should call actions", async () => {
  await using cleanupTasks = new CleanupTasks();
  const handler = mock((...args: any[]) => ({ ok: true }));

  const server = Bun.serve({
    port: port++,
    fetch: async (req) => Response.json(handler(await req.json())),
  });
  cleanupTasks.add(() => server.stop());

  const actionsTarget = new ActionsTarget(server.url, {
    hi: {
      description: undefined,
      sse: false,
      input: z
        .object({ name: z.string().optional(), metadata: z.record(z.string()) })
        .strict(),
      output: undefined,
    },
    foo: {
      description: "foo",
      sse: false,
      input: z.string(),
      output: z.object({ name: z.string() }).strict(),
    },
  }).compile();

  await actionsTarget.hi({ name: "jhon", metadata: {} });

  expect(handler).toBeCalled();
  expect(handler).nthCalledWith(1, { name: "jhon", metadata: {} });
});

it("should throw error if input is invalid", async () => {
  await using cleanupTasks = new CleanupTasks();
  const handler = mock((...args: any[]) => ({ ok: true }));

  const server = Bun.serve({
    port: port++,
    fetch: async (req) => Response.json(handler(await req.json())),
  });
  cleanupTasks.add(() => server.stop());

  const actionsTarget = new ActionsTarget(server.url, {
    hi: {
      description: undefined,
      sse: false,
      input: z
        .object({ name: z.string().optional(), metadata: z.record(z.string()) })
        .strict(),
      output: undefined,
    },
    foo: {
      description: "foo",
      sse: false,
      input: z.string(),
      output: z.object({ name: z.string() }).strict(),
    },
  }).compile();

  await expect(
    actionsTarget.hi({ name: "jhon" } as any),
  ).rejects.toThrowError();
});

it("should compile actions with input and output", () => {
  const actionsTarget = new ActionsTarget("http://localhost", {
    fn1: {
      description: undefined,
      sse: false,
      input: z.string(),
      output: z.string(),
    },
  } as const);

  type targets = ReturnType<typeof actionsTarget.compile>;

  expectTypeOf<targets["fn1"]>().toEqualTypeOf<
    (arg: string) => Promise<string>
  >;
});

it("should compile actions without input", () => {
  const actionsTarget = new ActionsTarget("http://localhost", {
    fn1: {
      description: undefined,
      sse: false,
      input: undefined,
      output: z.string(),
    },
  } as const);

  type targets = ReturnType<typeof actionsTarget.compile>;

  expectTypeOf<targets["fn1"]>().toEqualTypeOf<
    (arg?: unknown) => Promise<string>
  >;
});

it("should compile sse actions", () => {
  const actionsTarget = new ActionsTarget("http://localhost", {
    fn1: {
      description: undefined,
      sse: true,
      input: undefined,
      output: z.string(),
    },
  } as const);

  type targets = ReturnType<typeof actionsTarget.compile>;

  expectTypeOf<targets["fn1"]>().toEqualTypeOf<
    (arg?: unknown) => AsyncGenerator<string>
  >;
});

it("should call actions from http listener", async () => {
  await using cleanupTasks = new CleanupTasks();

  const httpLister = HTTPLister.fromModule({
    fn1: () => "ok",
    *fn2() {
      yield 1;
      yield 2;
    },
  });
  cleanupTasks.add(() => httpLister.close());

  const url = await httpLister.listen();

  const actionsTarget = new ActionsTarget(
    new URL(url),
    (await (await fetch(new URL("/__actions", url))).json()).actions,
  );

  const targets = actionsTarget.compile();

  expect(targets.fn2.prototype).toEqual(async function* () {}.prototype);

  const res = targets.fn2() as AsyncGenerator<any>;

  expect(await Array.fromAsync(res)).toEqual([1, 2]);
});

it("should throw error if sse action is not implemented", async () => {
  await using cleanupTasks = new CleanupTasks();

  const http2Lister = HTTPLister.fromModule({});
  cleanupTasks.add(() => http2Lister.close());

  const url = await http2Lister.listen(port++);

  const actionsJson = {
    actions: {
      fn: {
        description: null,
        sse: true,
        input: null,
        output: null,
      },
    },
  } as const;

  const actionsTarget = new ActionsTarget(new URL(url), actionsJson.actions);

  const targets = actionsTarget.compile();

  expect(async () => {
    await Array.fromAsync(targets.fn());
  }).toThrowError();
});

const originFetch = globalThis.fetch;
const mockFetch = mock(originFetch);

beforeAll(() => {
  globalThis.fetch = mockFetch;
});

afterAll(() => {
  globalThis.fetch = originFetch;
});

it("should call a action generator with http2", async () => {
  mockFetch.mockImplementation(
    // @ts-ignore
    (inputURL, requestInfo) => {
      const request = typeof inputURL === "object" ? inputURL : requestInfo;
      const url =
        inputURL instanceof URL
          ? inputURL
          : typeof inputURL === "string"
            ? new URL(inputURL)
            : "url" in inputURL
              ? new URL(inputURL.url)
              : new URL(inputURL);

      return new Promise((resolve, reject) => {
        const client = http2.connect(new URL("/", url), { ca: DEFAULT_CERT });

        client.addListener("error", (err) => {
          reject(err);
        });

        client.addListener("connect", () => {
          const clientStream = client.request({
            [http2.constants.HTTP2_HEADER_METHOD]: get.string(
              request,
              "method",
            ),
            [http2.constants.HTTP2_HEADER_PATH]: url.pathname,
            ...get.record(request, "headers"),
          });

          const body = new ReadableStream<any>({
            start: (ctrl) => {
              clientStream.addListener("data", (data) => {
                ctrl.enqueue(data);
              });

              clientStream.addListener("end", () => {
                ctrl.close();
              });
            },
          });

          clientStream.addListener("response", (response) => {
            const { ":status": status, ...headers } = response;

            resolve(
              new Response(body, {
                status,
                headers: Object.fromEntries(
                  Array.from(Object.entries(response), ([k, v]) => {
                    if (k.startsWith(":")) return [];
                    if (!v) return [];
                    if (typeof v === "string") return [[k, v]];
                    if (Array.from(v)) return v.map((v) => [k, v]);
                    return [];
                  }).flat(),
                ),
              }),
            );
          });
        });

        // reject(new Error('Not implemented yet'))
      });
    },
  );

  await using cleanupTasks = new CleanupTasks();

  const http2Lister = HTTP2Lister.fromModule(
    {
      async *fn() {
        yield 1;
        yield 2;
      },
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

  const url = await http2Lister.listen(port++);

  const actionsJson = {
    actions: {
      fn: {
        description: null,
        sse: true,
        input: null,
        output: null,
      },
    },
  } as const;

  const actionsTarget = new ActionsTarget(new URL(url), actionsJson.actions);

  const targets = actionsTarget.compile();

  expect(await Array.fromAsync(targets.fn())).toEqual([1, 2]);
});
