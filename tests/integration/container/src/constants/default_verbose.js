/**
 * A list of string values that are interpreted as "true" in a verbose context.
 * These values are commonly used to enable features or settings in configuration
 * or environment variables.
 *
 * Examples include:
 * - "true": A standard boolean representation.
 * - "1": A numeric representation of true.
 * - "on": Often used in toggles or switches.
 * - "yes": A textual confirmation.
 * - "y": A shorthand for "yes".
 * - "enabled": Indicates that a feature or setting is active.
 */
const VERBOSE_TRUE_VALUES = ["true", "1", "on", "yes", "y", "enabled"];
/**
 * Determines the default verbosity level for the Actioman container tests.
 *
 * This constant checks if the `process` object is defined and whether the
 * environment variable `TEST_ACTIOMAN_CONTAINER_VERBOSE` is set. If the
 * variable is defined, it evaluates whether its value (converted to lowercase)
 * is included in the predefined `VERBOSE_TRUE_VALUES` array. If the variable
 * is not set or the `process` object is undefined, the default value is `false`.
 *
 * @constant
 * @type {boolean}
 */
export const DEFAULT_VERBOSE =
  typeof process !== "undefined" &&
  process.env.TEST_ACTIOMAN_CONTAINER_VERBOSE !== undefined
    ? VERBOSE_TRUE_VALUES.includes(
        process.env.TEST_ACTIOMAN_CONTAINER_VERBOSE.toLowerCase(),
      )
    : false;
