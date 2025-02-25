import { Router } from "artur";
import { Actions, type Action } from "../actions/actions.js";
import { z } from "zod";
import { get } from "@jondotsoy/utils-js/get";
import { result } from "@jondotsoy/utils-js/result";
import { actionsToJson } from "../exporter-actions/exporter-actions.js";
import { Configs, type ConfigsModule } from "../configs/configs.js";
import { MetricsClient } from "../metric/metrics-client/metrics-client.js";

const isParser = (value: any): value is { parse: (value: any) => any } =>
  get.function(value, "parse") !== undefined;
const isZodType = (value: any): value is z.ZodType =>
  value instanceof z.ZodType;
const isSSEAction = (
  action: Action<any, any, any>,
): action is Action<any, any, true> => action.sse === true;

class EventStreamDataEncoder {
  encode(data: { id?: string; event?: string; data: any }) {
    const l = [];
    if (data.id) l.push(`id: ${data.id}`);
    if (data.event) l.push(`event: ${data.event}`);
    l.push(`data: ${JSON.stringify(data.data)}`);
    return new TextEncoder().encode(l.join("\n") + "\n\n");
  }
}

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

      const isSSE = isSSEAction(describe);
      const method = "POST";
      this.router.use(method, `/__actions/${name}`, {
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
          if (isSSE) return this.sseHandler(describe, req);
          return this.handler(describe, req);
        },
      });
    }
  }

  private async sseHandler(action: Action<any, any, true>, req: Request) {
    const url = new URL(req.url);
    const inputSearchParams = url.searchParams.get("input") ?? null;
    const [, data] = await result(() =>
      inputSearchParams ? JSON.parse(inputSearchParams) : null,
    );
    const input = isParser(action.input) ? action.input.parse(data) : null;
    const resultAction = await action.handler(input);
    const body = new ReadableStream<Uint8Array>({
      pull: async (ctrl) => {
        const [err, iteratorResult] = await result(() => resultAction.next());

        if (err) {
          console.error(err);
          ctrl.enqueue(
            new EventStreamDataEncoder().encode({
              event: "error",
              data: "Internal error",
            }),
          );
          return ctrl.close();
        }

        const { done, value } = iteratorResult;

        if (done) {
          ctrl.enqueue(
            new EventStreamDataEncoder().encode({
              event: "close",
              data: true,
            }),
          );
          return ctrl.close();
        }

        const output = isParser(action.output)
          ? action.output.parse(value)
          : value;

        ctrl.enqueue(new EventStreamDataEncoder().encode({ data: output }));
      },
    });
    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  private async handler(action: Action<any, any, any>, req: Request) {
    const [, data] = await result(() => req.json());
    const input = isParser(action.input) ? action.input.parse(data) : null;
    const resultDescribe = await action.handler(input);
    const output = isParser(action.output)
      ? action.output.parse(resultDescribe)
      : resultDescribe;
    return Response.json(output);
  }

  static fromModule(module: unknown, configs?: ConfigsModule) {
    const actions = Actions.fromModule(module, configs);
    if (!actions) throw new Error(`No actions found in ${module}`);
    return new HTTPRouter(actions, Configs.fromModule(configs));
  }
}
