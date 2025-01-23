import { describe, it, expect, afterEach } from "bun:test";
import { Actions, defineAction } from "../actions/actions";
import { z } from "zod";
import {
  ActionsDocument,
  actionsToJson,
  importActionsFromJson,
} from "./exporter-actions";
import type { ActionsDefinitionsJsonDTO } from "./dtos/actions-definitions-json.dto";
import { HTTPLister } from "../http-router/http-listener";

const cleanupTasks = new Set<() => any>();

describe("actionsToJson", () => {
  it("should export actions to JSON", () => {
    const actions = new Actions({
      hi: defineAction({
        description: "Say hello",
        input: z.object({
          name: z.string(),
        }),
        output: z.string(),
        handler: async ({ name }) => `hello ${name}`,
      }),
    });

    expect(actionsToJson(actions)).toMatchSnapshot();
  });
});

afterEach(async () => {
  for (const cleanupTask of cleanupTasks) await cleanupTask();
});

describe("importActionsFromJson", () => {
  afterEach(async () => {
    for (const cleanupTask of cleanupTasks) await cleanupTask();
  });

  it("should import actions from JSON", () => {
    expect(importActionsFromJson({}, "http://localhost")).toMatchSnapshot();
  });

  it("should import actions from JSON with different types", () => {
    expect(
      importActionsFromJson(
        {
          hi: {
            description: "Say hello",
            input: {
              type: "object",
              required: ["name"],
              properties: {
                name: {
                  type: "string",
                },
              },
            },
            output: {
              type: "string",
            },
          },
          foo: {
            description: null,
            input: null,
            output: null,
          },
        } satisfies ActionsDefinitionsJsonDTO,
        "http://localhost:9080",
      ),
    ).toMatchSnapshot();
  });
});

it("should create ActionsDocument from HTTP server", async () => {
  const httpLister = HTTPLister.fromModule({
    hi: {
      input: z.object({
        name: z.string().optional(),
        metadata: z.record(z.string()),
      }),
      handler: () => "ok",
    },
    foo: {
      description: "foo",
      input: z.string(),
      output: z.object({
        name: z.string(),
      }),
      handler: () => "ok",
    },
  });
  cleanupTasks.add(() => httpLister.close());
  const url = await httpLister.listen(43112);

  const actionsDocument = await ActionsDocument.fromHTTPServer(url);
  expect(actionsDocument.toString()).toMatchSnapshot();
});
