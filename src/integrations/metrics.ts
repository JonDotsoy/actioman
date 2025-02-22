import type { Integration } from "../configs/configs.js";

export const metrics = (): Integration => {
  return {
    name: "metrics",
    hooks: {
      "http:setup": (httpRouter) => {
        httpRouter.router.use("ALL", "/metrics", {
          fetch: () => {
            let body = "";

            for (const e of httpRouter.metrics) {
              const l = e.state.labels
                ? Object.entries(e.state.labels).map(
                    ([key, value]) => `${key}=${JSON.stringify(value)}`,
                  )
                : null;
              body += `${e.state.name}${l ? `{${l.join(",")}}` : ""} ${e.value}\n`;
            }

            return new Response(body);
          },
        });
      },
    },
  };
};
