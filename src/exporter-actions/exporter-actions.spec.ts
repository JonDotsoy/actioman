import { describe, it, expect } from "bun:test";
import { Actions, defineAction } from "../actions/actions";
import { z } from "zod";
import { actionsToJson, importActionsFromJson } from "./exporter-actions";
import type { ActionsDefinitionsJsonDTO } from "./dtos/actions-definitions-json.dto";

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

describe("importActionsFromJson", () => {
  it("should import actions from JSON", () => {
    expect(importActionsFromJson({}, "http://localhost")).toMatchSnapshot();
  });
  it("", () => {
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
