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
export declare const DEFAULT_VERBOSE: boolean;
