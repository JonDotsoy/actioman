/**
 * Valor por defecto para verbose en el proceso Docker y tests.
 * Puede ser sobreescrito por la variable de ambiente TEST_ACTIOMAN_CONTAINER_VERBOSE.
 * Los valores aceptados para activar verbose son: 'true', '1', 'on', 'yes', 'y', 'enabled' (case-insensitive).
 */
const VERBOSE_TRUE_VALUES = ["true", "1", "on", "yes", "y", "enabled"];
export const DEFAULT_VERBOSE =
  typeof process !== "undefined" &&
  process.env.TEST_ACTIOMAN_CONTAINER_VERBOSE !== undefined
    ? VERBOSE_TRUE_VALUES.includes(
        process.env.TEST_ACTIOMAN_CONTAINER_VERBOSE.toLowerCase(),
      )
    : false;
