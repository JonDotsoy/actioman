import client from "prom-client";
import { defaultRegistry } from "../registers/default_serie_register";

export const actioman_command_total = new client.Gauge({
  name: "actioman_command_total",
  help: "Total number of command invocations.",
  labelNames: ["command", "actioman_version"],
  registers: [defaultRegistry],
});
