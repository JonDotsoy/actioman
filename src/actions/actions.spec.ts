import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { expectTypeOf } from "expect-type";
import { Actions, defineAction } from "./actions";

describe("Actions", () => {
  it("should create a new action", () => {
    const actions = new Actions({
      foo: defineAction({
        handler: async () => "ok",
      }),
    });
  });

  it("should call a action", async () => {
    const actions = new Actions({
      foo: defineAction({
        handler: async () => "ok",
      }),
      taz: defineAction({
        handler: async () => "ok",
      }),
    });

    expect(await actions.call("foo", {})).toEqual("ok");
  });

  it("should call a action with input and output", async () => {
    const actions = new Actions({
      hi: defineAction({
        input: z.object({
          name: z.string(),
        }),
        output: z.string(),
        handler: async ({ name }) => `hello ${name}`,
      }),
    });

    expect(await actions.call("hi", { name: "juan" })).toEqual("hello juan");
  });

  it("should infer input and output types", async () => {
    const actions = new Actions({
      hi: defineAction({
        input: z.object({
          name: z.string(),
        }),
        output: z.string(),
        handler: async ({ name }) => `hello ${name}`,
      }),
    });

    type InputFromHiAction<T> = T extends (name: "hi", input: infer r) => any
      ? r
      : never;
    type ExtractResponseType<T> = T extends (name: "hi", input: any) => infer r
      ? r
      : never;
    type callActionInput = InputFromHiAction<typeof actions.call>;
    type extractedResponseType = Awaited<
      ExtractResponseType<typeof actions.call>
    >;

    expectTypeOf<callActionInput>().toEqualTypeOf<{ name: string }>;
    expectTypeOf<extractedResponseType>().toEqualTypeOf<string>;
  });
});
