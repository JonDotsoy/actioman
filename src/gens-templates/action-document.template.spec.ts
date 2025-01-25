import { describe, expect, it } from "bun:test";
import { actionDocumentTemplate } from "./action-document.template";
import { ActionsDocument } from "../exporter-actions/exporter-actions";
import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";

describe("actionDocumentTemplate", () => {
  it("should generate the actions target code", () => {
    expect(
      actionDocumentTemplate({
        cwd: "file:///app/my_app/my_actions/",
        actionTargetModuleLocation:
          "file:///app/my_app/node_modules/actioman/lib/esm/actions-target/actions-target.js",
        actionsDocument: new ActionsDocument(new URL("http://localhost"), {
          hi: {
            description: "foo",
            input: zodToJsonSchema(
              z.object({
                name: z.string(),
              }),
            ),
            output: zodToJsonSchema(
              z.object({
                outname: z.number().nullable(),
              }),
            ),
          },
          foo: {
            description: "foo",
            input: undefined,
            output: zodToJsonSchema(
              z.object({
                outname: z.number().nullable(),
              }),
            ),
          },
        }),
      }),
    ).toMatchSnapshot();
  });
});
