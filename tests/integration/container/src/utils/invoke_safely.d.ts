/**
 * invokeSafely
 * Executes an asynchronous function and catches any exception, returning undefined if an error occurs.
 * @template T
 * @param {() => Promise<T>} cb - Asynchronous callback to execute safely.
 * @returns {Promise<T | undefined>} The result of the function or undefined if an error occurs.
 */
export declare const invokeSafely: {
  <T>(cb: () => Promise<T>): Promise<T> | undefined;
  sync<T>(cb: () => T): T | undefined;
};
