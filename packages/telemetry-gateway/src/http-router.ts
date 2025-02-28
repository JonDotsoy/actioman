import { Router } from "artur";
import { result } from "@jondotsoy/utils-js/result";
import { z } from "zod";
import client from "prom-client";

export const telemetryEventSchema = z.object({
  type: z.literal("command_execution"),
  actioman_version: z.string(),
  command: z.string(),
  os_version: z.string().nullable().optional(),
  plugins_active: z.string().array().optional(),
  duration_ms: z.number().int().optional(),
  error_code: z.string().nullable().optional(),
});

const actioman_command_duration_milliseconds = new client.Histogram({
  name: "actioman_command_duration_milliseconds",
  help: "Histogram of command execution durations in milliseconds",
  labelNames: ["command", "actioman_version"],
});

const actioman_command_total = new client.Gauge({
  name: "actioman_command_total",
  help: "Total number of command invocations.",
  labelNames: ["command", "actioman_version"],
});

const actioman_version_info = new client.Gauge({
  name: "actioman_version_info",
  help: "Actioman version information.",
  labelNames: ["actioman_version"],
});

const actioman_plugins_active_total = new client.Counter({
  name: "actioman_plugins_active_total",
  help: "Total number of times each plugin is active.",
  labelNames: ["plugin_name", "actioman_version"],
});

const actioman_command_errors_total = new client.Counter({
  name: "actioman_command_errors_total",
  help: "Total number of errors per command and error code.",
  labelNames: ["command", "actioman_version", "error_code"],
});

export class HTTPRouter {
  constructor(
    readonly router = new Router({
      errorHandling: "default-catching",
    }),
  ) {
    router.use("PUT", "/collect", {
      fetch: async (req) => {
        const contentTypeHeader = req.headers.get("content-type");
        if (!contentTypeHeader?.startsWith("application/json"))
          return Response.json(
            { error: "Invalid content type" },
            { status: 400 },
          );
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

        payload.plugins_active?.forEach((plugin) => {
          actioman_plugins_active_total.inc({
            plugin_name: plugin,
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
  }
}
