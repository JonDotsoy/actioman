/**
 * invokeSafely
 * Executes an asynchronous function and catches any exception, returning undefined if an error occurs.
 * @template T
 * @param {() => Promise<T>} cb - Asynchronous callback to execute safely.
 * @returns {Promise<T | undefined>} The result of the function or undefined if an error occurs.
 */
export const invokeSafely = (cb) => {
  try {
    return cb();
  } catch (error) {
    return undefined;
  }
};
/**
 * invokeSafely.sync
 * Executes a synchronous function and catches any exception, returning undefined if an error occurs.
 * @template T
 * @param {() => T} cb - Synchronous callback to execute safely.
 * @returns {T | undefined} The result of the function or undefined if an error occurs.
 */
invokeSafely.sync = (cb) => {
  try {
    return cb();
  } catch (error) {
    return undefined;
  }
};
