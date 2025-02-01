import { expect, it, mock } from "bun:test";
import { ActionsTarget } from "./actions-target";
import { z } from "zod";
import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";

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
});
