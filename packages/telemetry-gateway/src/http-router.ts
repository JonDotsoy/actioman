import { Router } from "artur";
import { result } from "@jondotsoy/utils-js/result";
import { actioman_command_duration_milliseconds } from "./metrics_control/metrics/actioman_command_duration_milliseconds";
import { actioman_command_total } from "./metrics_control/metrics/actioman_command_total";
import { actioman_version_info } from "./metrics_control/metrics/actioman_version_info";
import { actioman_plugins_active_total } from "./metrics_control/metrics/actioman_plugins_active_total";
import { actioman_command_errors_total } from "./metrics_control/metrics/actioman_command_errors_total";
import { telemetryEventSchema } from "./schemas/telemetry_event_schema";
import { defaultRegistry } from "./metrics_control/registers/default_serie_register";
import client from "prom-client";

export class HTTPRouter {
  constructor(
    readonly router = new Router({
      middlewares: [
        (fetch) => async (req) => {
          const res = await fetch(req);
          res?.headers.set("X-Robots-Tag", "none");
          return res;
        },
      ],
      errorHandling: "default-catching",
    }),
  ) {
    router.use("GET", "/health", {
      fetch: () => Response.json({}),
    });

    router.use("PUT", "/collect", {
      fetch: async (req) => {
        const contentTypeHeader = req.headers.get("content-type");

        if (!contentTypeHeader?.startsWith("application/json")) {
          return Response.json(
            { error: "Invalid content type" },
            { status: 400 },
          );
        }

        const [error, payload] = await result(async () =>
          telemetryEventSchema.parse(await req.json()),
        );

        if (error) {
          console.error(error);
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        actioman_command_total.inc({
          command: payload.command,
          actioman_version: payload.actioman_version,
        });

        if (payload.duration_ms)
          actioman_command_duration_milliseconds.observe(
            {
              command: payload.command,
              actioman_version: payload.actioman_version,
            },
            payload.duration_ms,
          );

        actioman_version_info.inc({
          actioman_version: payload.actioman_version,
        });

        payload.plugins_active?.forEach((plugin_name) => {
          actioman_plugins_active_total.inc({
            plugin_name: plugin_name,
            actioman_version: payload.actioman_version,
          });
        });

        if (payload.error_code)
          actioman_command_errors_total.inc({
            command: payload.command,
            actioman_version: payload.actioman_version,
            error_code: payload.error_code,
          });

        return Response.json("Thanks ♥️!");
      },
    });

    router.use("GET", "/metrics", {
      fetch: async () =>
        new Response(
          `${await defaultRegistry.metrics()}\n${await client.register.metrics()}`,
        ),
    });
  }
}
