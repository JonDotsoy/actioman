/**
 * Prepares and manages a shared asynchronous resource or computation for a test suite.
 *
 * This utility allows you to define a setup function that runs once before all tests,
 * and provides access to its result in any test. The setup function can be synchronous
 * or asynchronous. The returned object exposes two methods:
 *
 * - initialize: Runs the setup function and resolves the shared result. Intended to be called in a beforeAll hook.
 * - result: Returns a promise that resolves to the value produced by the setup function.
 *
 * @template T The type of the value returned by the setup function.
 * @param {() => T | Promise<T>} fn - The setup function to execute before all tests. Can be sync or async.
 * @returns {{ initialize: () => Promise<void>, result: () => Promise<T> }} An object with initialize and result methods.
 *
 * @example
 * // Prepare a database connection for all tests in the suite
 * const dbResource = arrange(async () => {
 *   const db = await connectToDatabase();
 *   return db;
 * });
 *
 * beforeAll(async () => {
 *   await dbResource.initialize();
 * });
 *
 * test('should query the database', async () => {
 *   const db = await dbResource.result();
 *   const result = await db.query('SELECT * FROM users');
 *   expect(result).toBeDefined();
 * });
 */
export declare const arrange: <T>(fn: () => T) => {
  (): Promise<T>;
  initialize: () => Promise<void>;
  result: () => Promise<T>;
};
