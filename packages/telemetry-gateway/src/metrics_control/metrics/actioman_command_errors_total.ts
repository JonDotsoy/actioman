import client from "prom-client";
import { defaultRegistry } from "../registers/default_serie_register";

export const actioman_command_errors_total = new client.Counter({
  name: "actioman_command_errors_total",
  help: "Total number of errors per command and error code.",
  labelNames: ["command", "actioman_version", "error_code"],
  registers: [defaultRegistry],
});
