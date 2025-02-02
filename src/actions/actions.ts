import type { z } from "zod";
import type { Configs, ConfigsModule } from "../configs/configs.js";
export * as actions from "../share-actions/share-actions.js";

type InferZodType<T> = T extends z.ZodType ? z.infer<T> : any;
type ParameterTypeInferer<T> = T extends (i: infer R) => any ? R : any;

export type Action<InputType = any, ResultType = any, T = any> = {
  description?: string;
  input?: InputType;
  output?: ResultType;
  handler: (
    input: InferZodType<InputType>,
  ) => InferZodType<ResultType> | Promise<InferZodType<ResultType>>;
};

export const defineAction = <I = any, R = any>(
  action: Action<I, R>,
): Action<I, R> => action;

export class Actions<ActionsDefinitions extends Record<string, Action> = any> {
  constructor(private definition: ActionsDefinitions) {}

  call = async <NameActionDefinition extends keyof ActionsDefinitions>(
    name: NameActionDefinition,
    input: ParameterTypeInferer<
      ActionsDefinitions[NameActionDefinition]["handler"]
    >,
  ): Promise<
    ReturnType<ActionsDefinitions[NameActionDefinition]["handler"]>
  > => {
    const definition = this.definition[name];
    if (!definition) throw new Error(`Action ${name.toString()} not found`);
    return await definition.handler(input);
  };

  static describe(actions: Actions): Record<string, Action> {
    return actions.definition;
  }

  static fromModule(module: unknown, configs?: ConfigsModule) {
    const isRecord =
      typeof module === "object" && module !== null && !Array.isArray(module);

    if (!isRecord) return null;

    const actionDefinitions: Record<string, Action> = {};

    for (const [moduleName, handler] of Object.entries(module)) {
      const definition =
        typeof handler === "function"
          ? defineAction({ handler })
          : typeof handler === "object" &&
              handler !== null &&
              "handler" in handler &&
              typeof handler.handler === "function"
            ? defineAction({ handler: handler.handler, ...handler })
            : null;
      if (definition) {
        actionDefinitions[moduleName] = definition;
      }
    }

    return new Actions(actionDefinitions);
  }
}
