import type { Telemetry } from "../../telemetry/telemetry";
import type { MessageTrace } from "../../telemetry/message-trace";

export type CliContextDTO = {
  telemetry: Telemetry;
  pendingMessage: MessageTrace;
};
