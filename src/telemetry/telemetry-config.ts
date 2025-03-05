const truthyValues: Record<string, true | undefined> = {
  true: true,
  "1": true,
  yes: true,
  on: true,
  enabled: true,
  active: true,
};

const falsyValues: Record<string, false | undefined> = {
  false: false,
  "0": false,
  no: false,
  off: false,
  disabled: false,
  inactive: false,
};

const isTrurty = (value: unknown) => {
  if (value === true) return true;
  if (typeof value === "string")
    return truthyValues[value.toLowerCase()] ?? null;
  return null;
};

const isFalsy = (value: unknown) => {
  if (value === false) return false;
  if (typeof value === "string")
    return falsyValues[value.toLowerCase()] ?? null;
  return null;
};

/* ENVIRONMENT */
const ACTIOMAN_TELEMETRY_DEBUG = isTrurty(process.env.ACTIOMAN_TELEMETRY_DEBUG);
const ACTIOMAN_TELEMETRY_VERBOSE = isTrurty(
  process.env.ACTIOMAN_TELEMETRY_VERBOSE,
);
const ACTIOMAN_TELEMETRY_DSN = process.env.ACTIOMAN_TELEMETRY_DSN;
const ACTIOMAN_TELEMETRY_DISABLED = isFalsy(
  process.env.ACTIOMAN_TELEMETRY_DISABLED,
);
const CI = isTrurty(process.env.CI);
const GITHUB_ACTIONS = isTrurty(process.env.GITHUB_ACTIONS);
const NODE_ENV_IS_TEST = process.env.NODE_ENV === "test";

const disabledByCI = CI === true ? false : null;
const disabledByGithubActions = GITHUB_ACTIONS === true ? false : null;
const disabledByNodeEnvTest = NODE_ENV_IS_TEST === true ? false : null;

const actiomanTelemetryDsnUrl =
  ACTIOMAN_TELEMETRY_DSN && URL.canParse(ACTIOMAN_TELEMETRY_DSN)
    ? new URL(ACTIOMAN_TELEMETRY_DSN)
    : null;

export type TelemetryConfig = {
  /** Whether telemetry is enabled or not */
  enabled: boolean;
  /** Whether debug mode is enabled or not */
  debug: boolean;
  /** Whether verbose mode is enabled or not */
  verbose: boolean;
  /** The Data Source Name (DSN) for telemetry */
  dsn: URL;
  /** The timeout for telemetry requests in milliseconds */
  timeout: number;
};

export const defaultTelemetryConfig = (
  initConfig?: Partial<TelemetryConfig>,
): TelemetryConfig => {
  return {
    enabled:
      initConfig?.enabled ??
      ACTIOMAN_TELEMETRY_DISABLED ??
      disabledByCI ??
      disabledByGithubActions ??
      disabledByNodeEnvTest ??
      true,
    debug: initConfig?.debug ?? ACTIOMAN_TELEMETRY_DEBUG ?? false,
    verbose: initConfig?.verbose ?? ACTIOMAN_TELEMETRY_VERBOSE ?? false,
    dsn:
      initConfig?.dsn ??
      actiomanTelemetryDsnUrl ??
      new URL(`https://actioman-metrics.jon.soy/collect`),
    /** milliseconds */
    timeout: initConfig?.timeout ?? 10000 /** 10s */,
  };
};
