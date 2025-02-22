import { Router } from "artur";
import { Actions } from "../actions/actions.js";
import { z } from "zod";
import { get } from "@jondotsoy/utils-js/get";
import { actionsToJson } from "../exporter-actions/exporter-actions.js";
import { Configs, type ConfigsModule } from "../configs/configs.js";
import { MetricsClient } from "../metric/metrics-client/metrics-client.js";

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
  router: Router<"pass">;
  metrics: MetricsClient;

  constructor(
    actions: Actions,
    readonly configs?: Configs,
  ) {
    const actionsJson = actionsToJson(actions);

    this.metrics = new MetricsClient();

    this.router = new Router({
      errorHandling: "pass",
      middlewares: [
        ...(configs?.httpListenerMiddlewares ?? []),
        (fetch) => async (req) => {
          const res = await fetch(req);
          res?.headers.set("X-Powered-By", "Actioman");
          res?.headers.set("X-Actioman-Version", "v1.0.0");
          return res;
        },
      ],
    });

    configs?.httpSetup(this);

    this.router.use("GET", `/__actions`, {
      fetch: () => Response.json({ actions: actionsJson }),
    });

    for (const [name, describe] of Object.entries(Actions.describe(actions))) {
      const metricLabels = {
        action: name,
      };

      const requestErrorCountersMetric = this.metrics.counter({
        name: "request_error_counters",
        labels: metricLabels,
      });
      const requestCountersMetric = this.metrics.counter({
        name: "request_counters",
        labels: metricLabels,
      });
      const requestDataTransferenceBytesMetric = this.metrics.counter({
        name: "request_data_transference_bytes",
        labels: metricLabels,
      });
      const requestDurationSecondsMetric = this.metrics.averageBySecond({
        name: "request_duration_seconds",
        labels: metricLabels,
      });

      this.router.use("POST", `/__actions/${name}`, {
        middlewares: [
          (fetch) => (req) => {
            const start = Date.now();
            requestCountersMetric.increment();
            return Promise.resolve(fetch(req))
              .catch((err) => {
                requestErrorCountersMetric.increment();
                throw err;
              })
              .finally(() => {
                requestDurationSecondsMetric.add(Date.now() - start);
              });
          },
        ],
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

  static fromModule(module: unknown, configs?: ConfigsModule) {
    const actions = Actions.fromModule(module, configs);
    if (!actions) throw new Error(`No actions found in ${module}`);
    return new HTTPRouter(actions, Configs.fromModule(configs));
  }
}
