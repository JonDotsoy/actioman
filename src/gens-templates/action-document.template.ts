import * as path from "path";
import type { ActionsDocument } from "../exporter-actions/exporter-actions.js";
import { get } from "@jondotsoy/utils-js/get";
import jsonSchemaToZod from "json-schema-to-zod";
import {
  $,
  $arrowFunction,
  $call,
  $const,
  $doc,
  $exportDefault,
  $import,
  $indentifier,
  $new,
  $object,
  $string,
  $undefined,
  render,
} from "./typescript-factory/typescript-factory.js";

type getProgramASTParams = {
  actionTargetUrl: string;
  actionModulePath: string;
  actionDefinitions: Record<
    string,
    {
      description: string | null | undefined;
      input?: string | null;
      output?: string | null;
    }
  >;
};

const getProgramAST = (params: getProgramASTParams) =>
  $doc([
    $import("zod", [`z`]),
    $import(params.actionModulePath, [`ActionsTarget`]),
    $const(
      "createActionsTarget",
      $arrowFunction(
        $call(
          $(
            $new(
              "ActionsTarget",
              $string(params.actionTargetUrl),
              $object(
                Object.fromEntries(
                  Array.from(
                    Object.entries(params.actionDefinitions),
                    ([key, values]) => [
                      key,
                      $object({
                        description: values.description
                          ? $string(values.description)
                          : $undefined(),
                        input: values.input
                          ? $indentifier(values.input)
                          : $undefined(),
                        output: values.output
                          ? $indentifier(values.output)
                          : $undefined(),
                      }),
                    ],
                  ),
                ),
              ),
            ),
            "compile",
          ),
        ),
      ),
    ),
    $exportDefault($("createActionsTarget")),
  ]);

type Params = {
  fileLocation: string;
  actionTargetModuleLocation: string;
  actionsDocument: ActionsDocument;
};

export const actionDocumentTemplate = (params: Params) => {
  const toJsonZod = (value: Record<any, any> | undefined) => {
    if (value) return jsonSchemaToZod(value);
    return "undefined";
  };

  const ast = getProgramAST({
    actionModulePath: `./${path.relative(new URL("./", new URL(params.fileLocation, "file://")).pathname, new URL(params.actionTargetModuleLocation, "file://").pathname)}`,
    actionTargetUrl: params.actionsDocument.targetUrl.toString(),
    actionDefinitions: Object.fromEntries(
      Array.from(
        Object.entries(params.actionsDocument.actionsJson),
        ([key, actionDescription]) => [
          key,
          {
            description: get.string(actionDescription, "description"),
            input: toJsonZod(get.record(actionDescription, "input")),
            output: toJsonZod(get.record(actionDescription, "output")),
          },
        ],
      ),
    ),
  });

  return `// @ts-nocheck\n${render(ast)}`;
};
