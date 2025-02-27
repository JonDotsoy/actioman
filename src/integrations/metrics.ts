import type { Integration } from "../configs/configs.js";
import { MetricTextEncoder } from "../metric/metric-text-encoder.js";

export const metrics = (): Integration => {
  return {
    name: "metrics",
    hooks: {
      "http:setup": (httpRouter) => {
        httpRouter.router.use("ALL", "/metrics", {
          fetch: () => {
            const metrics = httpRouter.metrics.metrics();

            return new Response(
              new ReadableStream<Uint8Array>({
                pull: (ctrl) => {
                  const { done, value } = metrics.next();

                  if (done) return ctrl.close();

                  const metricText = new MetricTextEncoder().encode({
                    name: value.name,
                    labels: value.labels,
                    value: value.value,
                    timestamp: value.timestamp,
                    // help: value.help,
                  });

                  ctrl.enqueue(new TextEncoder().encode(metricText));
                  ctrl.enqueue(new Uint8Array([10]));
                },
              }),
              {
                headers: {
                  "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
                },
              },
            );
          },
        });
      },
    },
  };
};
