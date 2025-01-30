import { Router } from "artur";
import { Actions } from "../actions/actions.js";
import { z } from "zod";
import { get } from "@jondotsoy/utils-js/get";
import { actionsToJson } from "../exporter-actions/exporter-actions.js";

const result = async <T>(fn: () => Promise<T>) => {
  try {
    return { error: null, data: await fn() };
  } catch (error) {
    return { error, data: null };
  }
};

const isParser = (value: any): value is { parse: (value: any) => any } =>
  get.function(value, "parse") !== undefined;
const isZodType = (value: any): value is z.ZodType =>
  value instanceof z.ZodType;

export class HTTPRouter {
  router = new Router({
    errorHandling: "pass",
    middlewares: [
      (fetch) => async (req) => {
        const res = await fetch(req);
        res?.headers.set("X-Powered-By", "Actioman");
        res?.headers.set("X-Actioman-Version", "v1.0.0");
        return res;
      },
    ],
  });
  constructor(actions: Actions) {
    const actionsJson = actionsToJson(actions);

    this.router.use("GET", `/__actions`, {
      fetch: () => Response.json({ actions: actionsJson }),
    });

    for (const [name, describe] of Object.entries(Actions.describe(actions))) {
      this.router.use("POST", `/__actions/${name}`, {
        fetch: async (req) => {
          const { data } = await result(() => req.json());
          const input = isParser(describe.input)
            ? describe.input.parse(data)
            : null;
          const resultDescribe = await describe.handler(input);
          const output = isParser(describe.output)
            ? describe.output.parse(resultDescribe)
            : resultDescribe;
          return Response.json(output);
        },
      });
    }
  }

  static fromModule(module: unknown) {
    const actions = Actions.fromModule(module);
    if (!actions) throw new Error(`No actions found in ${module}`);
    return new HTTPRouter(actions);
  }
}
