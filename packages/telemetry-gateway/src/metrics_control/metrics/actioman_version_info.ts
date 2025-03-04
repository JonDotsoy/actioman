import client from "prom-client";
import { defaultRegistry } from "../registers/default_serie_register";

export const actioman_version_info = new client.Gauge({
  name: "actioman_version_info",
  help: "Actioman version information.",
  labelNames: ["actioman_version"],
  registers: [defaultRegistry],
});
