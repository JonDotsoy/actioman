const ON_VALUES = ["true", "1", "yes", "on", "enabled", "active"];
const OFF_VALUES = ["false", "0", "no", "off", "disabled", "inactive"];

const isOn = (value: unknown) =>
  typeof value === "string"
    ? ON_VALUES.includes(value.toLowerCase())
      ? true
      : null
    : null;
const isOff = (value: unknown) =>
  typeof value === "string"
    ? OFF_VALUES.includes(value.toLowerCase())
      ? false
      : null
    : null;

const ACTIOMAN_TELEMETRY_DSN = process.env.ACTIOMAN_TELEMETRY_DSN;

const actiomanTelemetryDsnUrl = ACTIOMAN_TELEMETRY_DSN
  ? URL.canParse(ACTIOMAN_TELEMETRY_DSN)
    ? new URL(ACTIOMAN_TELEMETRY_DSN)
    : null
  : null;

export type TelemetryConfig = {
  enabled: boolean;
  debug: boolean;
  verbose: boolean;
  dsn: URL;
  /** milliseconds */
  timeout: number;
};

export const defaultTelemetryConfig = (
  initConfig?: Partial<TelemetryConfig>,
): TelemetryConfig => {
  return {
    enabled:
      initConfig?.enabled ??
      isOn(process.env.ACTIOMAN_TELEMETRY_ENABLED) ??
      true,
    debug:
      initConfig?.debug ?? isOn(process.env.ACTIOMAN_TELEMETRY_DEBUG) ?? false,
    verbose:
      initConfig?.verbose ??
      isOn(process.env.ACTIOMAN_TELEMETRY_VERBOSE) ??
      false,
    dsn:
      initConfig?.dsn ??
      actiomanTelemetryDsnUrl ??
      new URL(`https://actioman-metrics.jon.soy/collect`),
    /** milliseconds */
    timeout: initConfig?.timeout ?? 10000 /** 10s */,
  };
};
