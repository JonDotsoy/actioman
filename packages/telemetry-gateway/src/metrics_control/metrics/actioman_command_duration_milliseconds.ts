import client from "prom-client";
import { defaultRegistry } from "../registers/default_serie_register";

export const actioman_command_duration_milliseconds = new client.Summary({
  name: "actioman_command_duration_milliseconds",
  help: "Histogram of command execution durations in milliseconds",
  labelNames: ["command", "actioman_version"],
  ageBuckets: 5,
  maxAgeSeconds: 5 * 60 /** 5 minutes */,
  registers: [defaultRegistry],
});
