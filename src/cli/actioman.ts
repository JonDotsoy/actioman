#!/usr/bin/env node

import { MessageTrace } from "../telemetry/message-trace.js";
import { defaultTelemetryConfig } from "../telemetry/telemetry-config.js";
import { Telemetry } from "../telemetry/telemetry.js";
import { main } from "./cmds/main.js";

const telemetry = new Telemetry(defaultTelemetryConfig()).start();
const pendingMessage = new MessageTrace(telemetry);

pendingMessage.type = "command_execution";

await main(process.argv.slice(2), {
  telemetry,
  pendingMessage,
}).finally(() => {
  pendingMessage.push();
});
