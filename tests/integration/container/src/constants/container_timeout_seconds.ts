/**
 * The timeout duration (in seconds) for a container operation.
 *
 * This value is determined by the environment variable `CONTAINER_TIMEOUT_SECONDS`.
 * If the environment variable is set and contains a valid numeric value, it will be used.
 * Otherwise, a default value of 600 seconds (10 minutes) is applied.
 */
export const CONTAINER_TIMEOUT_SECONDS = (() => {
  const env = process.env.CONTAINER_TIMEOUT_SECONDS;
  if (typeof env === "string" && /^\d+$/.test(env)) {
    return Number(env);
  }
  return 10 * 60;
})();
