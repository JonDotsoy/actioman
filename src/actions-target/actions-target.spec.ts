import { afterEach, describe, expect, it, mock } from "bun:test";
import { ActionsTarget } from "./actions-target";
import { z } from "zod";

let port = 6767;

const cleanupTasks = new Set<() => any>();

afterEach(async () => {
  for (const cleanupTask of cleanupTasks) await cleanupTask();
  cleanupTasks.clear();
});

it("", async () => {
  const handler = mock((...args: any[]) => ({ ok: true }));

  const server = Bun.serve({
    port: port++,
    fetch: async (req) => Response.json(handler(await req.json())),
  });
  cleanupTasks.add(() => server.stop());

  const actionsTarget = new ActionsTarget(server.url, {
    hi: {
      description: undefined,
      input: z
        .object({ name: z.string().optional(), metadata: z.record(z.string()) })
        .strict(),
      output: undefined,
    },
    foo: {
      description: "foo",
      input: z.string(),
      output: z.object({ name: z.string() }).strict(),
    },
  }).compile();

  await actionsTarget.hi({ name: "jhon", metadata: {} });

  expect(handler).toBeCalled();
  expect(handler).nthCalledWith(1, { name: "jhon", metadata: {} });
});

it("", async () => {
  const handler = mock((...args: any[]) => ({ ok: true }));

  const server = Bun.serve({
    port: port++,
    fetch: async (req) => Response.json(handler(await req.json())),
  });
  cleanupTasks.add(() => server.stop());

  const actionsTarget = new ActionsTarget(server.url, {
    hi: {
      description: undefined,
      input: z
        .object({ name: z.string().optional(), metadata: z.record(z.string()) })
        .strict(),
      output: undefined,
    },
    foo: {
      description: "foo",
      input: z.string(),
      output: z.object({ name: z.string() }).strict(),
    },
  }).compile();

  await expect(
    actionsTarget.hi({ name: "jhon" } as any),
  ).rejects.toThrowError();
  await actionsTarget.hi({ name: "jhon" } as any);
});
