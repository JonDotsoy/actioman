import client from "prom-client";
import { defaultRegistry } from "../registers/default_serie_register";

export const actioman_plugins_active_total = new client.Counter({
  name: "actioman_plugins_active_total",
  help: "Total number of times each plugin is active.",
  labelNames: ["plugin_name", "actioman_version"],
  registers: [defaultRegistry],
});
