/**
 * logger
 * Creates a simple logger with info and error methods, which can be enabled or disabled.
 *
 * @param {boolean} [enable=true] - Whether logging is enabled. If false, logging is suppressed.
 * @returns {{ info: Function, error: Function }} An object with info and error logging methods.
 *
 * Usage:
 *   const log = logger();
 *   log.info('This is an info message');
 *   log.error('This is an error message');
 */
export const logger = (enable: boolean = true) => {
  return {
    info: (...args: any[]) => {
      if (!enable) return;
      console.log(...args);
    },
    error: (...args: any[]) => {
      if (!enable) return;
      console.error(...args);
    },
  };
};
