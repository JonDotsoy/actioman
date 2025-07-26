import { Atom } from "./atom";
/**
 * logger
 * Creates a simple logger with info and error methods, which can be enabled or disabled dynamically.
 *
 * @param {boolean | Atom<boolean>} [initEnable=true] - Indicates if logging is enabled. Can be a boolean or a reactive Atom<boolean>.
 *   If an Atom is provided, the logger will automatically react to its value changes.
 * @returns {{ info: Function, error: Function, enable: Function, disable: Function }} An object with info, error, enable, and disable methods.
 *
 * Usage:
 *   const log = logger();
 *   log.info('This is an info message');
 *   log.error('This is an error message');
 *   log.disable(); // Disables logging
 *   log.enable(true); // Enables logging
 *
 * Also supports reactive integration with Atom<boolean>:
 *   const atom = new Atom(true);
 *   const log = logger(atom);
 *   atom.set(false); // Logger is automatically disabled
 */
export const logger = (initEnable = true) => {
  let enable = initEnable instanceof Atom ? initEnable.get() : initEnable;
  if (initEnable instanceof Atom) {
    initEnable.listen(() => {
      enable = initEnable.get();
    });
  }
  return {
    enable: (value) => {
      enable = value;
    },
    disable: () => {
      enable = false;
    },
    info: (...args) => {
      if (!enable) return;
      console.log(...args);
    },
    error: (...args) => {
      if (!enable) return;
      console.error(...args);
    },
  };
};
