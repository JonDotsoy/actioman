import { z } from "zod";
import type {
  ActionDefinitionJsonDTO,
  ActionsDefinitionsJsonDTO,
} from "../exporter-actions/dtos/actions-definitions-json.dto.js";
import { requestEventSource } from "./request-event-source/request-event-source.js";

type Infer<T> = T extends z.ZodTypeAny ? z.infer<T> : unknown;
type InferWithOptional<T> = T extends z.ZodTypeAny
  ? [arg: z.infer<T>]
  : [arg?: unknown];

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
      new URL(`__actions/${name.toString()}`, this.targetUrl).toString(),
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

  async *callSSE(
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

    const abort = new AbortController();

    const res = await fetch(
      new URL(`__actions/${name.toString()}`, this.targetUrl).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputParser(input)),
        signal: abort.signal,
      },
    );

    if (res.status !== 200)
      throw new Error(`Invalid status ${res.status} ${await res.text()}`);

    for await (const eventObj of requestEventSource(res)) {
      const { id, event = "message", data } = eventObj;

      if (event === "close") {
        abort.abort();
        return;
      }

      if (event === "message") {
        yield outputParser(JSON.parse(data));
        continue;
      }
    }
  }

  compile(): {
    [K in keyof T]: (
      ...inputArgs: InferWithOptional<T[K]["input"]>
    ) => T[K]["sse"] extends true
      ? AsyncGenerator<Infer<T[K]["output"]>>
      : Promise<Infer<T[K]["output"]>>;
  } {
    return Object.fromEntries(
      Object.entries(this.definitions).map(([name, actionDefiniton]) => {
        const self = this;

        const handler = actionDefiniton.sse
          ? async function* (input: any) {
              yield* self.callSSE(name, actionDefiniton, input);
            }
          : async function (input: any) {
              return self.call(name, actionDefiniton, input);
            };

        handlerActionDefinitionRefs.set(actionDefiniton, handler);

        return [name, handler];
      }),
    ) as any;
  }
}
