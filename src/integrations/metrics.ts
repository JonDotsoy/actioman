import type { Integration } from "../configs/configs.js";
import { MetricTextEncoder } from "../metric/metric-text-encoder.js";

export const metrics = (): Integration => {
  return {
    name: "metrics",
    hooks: {
      "http:setup": (httpRouter) => {
        httpRouter.router.use("ALL", "/metrics", {
          fetch: () => {
            let body = "";

            for (const e of httpRouter.metrics) {
              const metricText = new MetricTextEncoder().encode({
                name: e.state.name,
                labels: e.state.labels,
                value: e.value,
              });

              body += `${metricText}\n`;
            }

            return new Response(body, {
              headers: {
                "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
              },
            });
          },
        });
      },
    },
  };
};
