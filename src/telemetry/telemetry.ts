import { result } from "@jondotsoy/utils-js/result";
import {
  type TelemetryConfig,
  defaultTelemetryConfig,
} from "./telemetry-config.js";
import { ACTIOMAN_VERSION } from "../actioman-version.js";
import { Logger } from "./logger/logger.js";

export type MetricMessage = {
  type: "command_execution";
  command: string;
  // actioman_version?: string;
  os_version?: string | null | undefined;
  plugins_active?: string[];
  duration_ms?: number;
  error_code?: string | null;
};

export class Telemetry {
  private started = Promise.withResolvers<true>();
  private continuePromise = Promise.withResolvers<true>();
  private events = new Set<MetricMessage>();

  constructor(
    readonly configs: TelemetryConfig = defaultTelemetryConfig(),
    /** Logs to send no relevant information */
    readonly loggerVerbose = new Logger("Telemetry: ", configs.verbose),
    /** Logs to send error or important information */
    readonly loggerDebug = new Logger(
      "Telemetry: ",
      configs.verbose || configs.debug,
    ),
  ) {
    loggerVerbose.log(
      `started at ${new Date().toISOString()} configs: ${JSON.stringify(configs)}`,
    );
    this.started.promise.then(() => this.processQueueLoop());
  }

  private async processQueueLoop() {
    this.loggerVerbose.log(`started at ${new Date().toISOString()}`);
    while (true) {
      for (const event of this.events) {
        await this.putMetric(event);
        this.events.delete(event);
      }
      this.continuePromise = Promise.withResolvers<true>();
      await this.continuePromise.promise;
    }
  }

  start() {
    this.continue();
    this.started.resolve(true);
    return this;
  }

  continue() {
    this.continuePromise.resolve(true);
  }

  push(event: MetricMessage) {
    this.events.add(event);
    this.continue();
  }

  async putMetric(message: MetricMessage) {
    if (!this.configs.enabled) {
      this.loggerVerbose.log(
        `disabled. Skipping message: ${JSON.stringify(message)}`,
      );
      return;
    }
    const body = new TextEncoder().encode(
      JSON.stringify({
        ...message,
        actioman_version: ACTIOMAN_VERSION,
      }),
    );

    this.loggerVerbose.log(
      `send to ${this.configs.dsn.toString()} (${body.length} bytes)`,
    );
    const [error, res] = await result(() =>
      fetch(this.configs.dsn, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body,
        signal: AbortSignal.timeout(this.configs.timeout),
      }),
    );

    if (!error)
      this.loggerVerbose.log(`send success to ${this.configs.dsn.toString()}`);

    if (error) {
      this.loggerDebug.error(
        `send failed to ${this.configs.dsn.toString()}`,
        error,
      );
    }
  }
}
