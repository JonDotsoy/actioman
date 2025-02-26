import { expect, it, mock } from "bun:test";
import { ActionsTarget } from "./actions-target";
import { z } from "zod";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { HTTPLister } from "../http-router/http-listener";
import { expectTypeOf } from "expect-type";

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
