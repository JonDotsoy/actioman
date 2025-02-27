import type { Integration } from "../configs/configs.js";
import client from "prom-client";

export const metrics = (): Integration => {
  return {
    name: "metrics",
    hooks: {
      "http:setup": (httpRouter) => {
        httpRouter.router.use("ALL", "/metrics", {
          fetch: async () => {
            const body = await client.register.metrics();

            return new Response(new TextEncoder().encode(body), {
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
