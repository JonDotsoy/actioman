import { z } from "zod";
import type {
  ActionDefinitionJsonDTO,
  ActionsDefinitionsJsonDTO,
} from "../exporter-actions/dtos/actions-definitions-json.dto";

type Infer<T> = T extends z.ZodTypeAny ? z.infer<T> : unknown;

const handlerActionDefinitionRefs = new WeakMap<ActionDefinitionJsonDTO, any>();

const toParser = (
  type: "input" | "output",
  actionDefiniton: ActionDefinitionJsonDTO,
  value: unknown,
  actionName: unknown,
) =>
  value instanceof z.ZodType
    ? (v: unknown) => {
        const { success, data, error } = value.safeParse(v);
        if (!success) {
          const formattedActionMessage =
            type === "input"
              ? `${actionName}(${JSON.stringify(v)})`
              : `${actionName}(...) => ${JSON.stringify(v)}`;

          const err = new Error(
            `Invalid ${type} for action ${formattedActionMessage}`,
            {
              cause: error,
            },
          );

          if (handlerActionDefinitionRefs.has(actionDefiniton)) {
            Error.captureStackTrace(
              err,
              handlerActionDefinitionRefs.get(actionDefiniton),
            );
          }
          throw err;
        }
        return data;
      }
    : (v: unknown) => v;

export class ActionsTarget<T extends ActionsDefinitionsJsonDTO> {
  constructor(
    readonly targetUrl: URL | string,
    readonly definitions: T,
  ) {
    if (!URL.canParse(targetUrl)) throw new Error(`Invalid ${targetUrl} url`);
  }

  async call(
    name: keyof T,
    actionDefiniton: ActionDefinitionJsonDTO,
    input: any,
  ) {
    const inputParser = toParser(
      "input",
      actionDefiniton,
      actionDefiniton.input,
      name,
    );
    const outputParser = toParser(
      "output",
      actionDefiniton,
      actionDefiniton.output,
      name,
    );

    const res = await fetch(
      new URL(`__actions/${name.toString()}`, this.targetUrl),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputParser(input)),
      },
    );

    if (res.status !== 200)
      throw new Error(`Invalid status ${res.status} ${await res.text()}`);

    return outputParser(await res.json());
  }

  compile(): {
    [K in keyof T]: (
      input: Infer<T[K]["input"]>,
    ) => Promise<Infer<T[K]["output"]>>;
  } {
    return Object.fromEntries(
      Object.entries(this.definitions).map(([name, actionDefiniton]) => {
        const handler = async (input: any): Promise<any> => {
          return this.call(name, actionDefiniton, input);
        };

        handlerActionDefinitionRefs.set(actionDefiniton, handler);

        return [name, handler];
      }),
    ) as any;
  }
}
