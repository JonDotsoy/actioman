/**
 * Atom<T> is a class that implements a simple reactive container for a value of type T.
 * It allows subscribing to value changes and notifies subscribers when the value changes.
 *
 * Main methods:
 * - constructor(init: T): Initializes the atom's value.
 * - set(value: T): Updates the value and notifies subscribers.
 * - get(): Returns the current value.
 * - listen(fn): Adds a subscriber, but does not execute it immediately. Returns an unsubscribe function.
 * - subscribe(fn): Adds a subscriber and executes it immediately. Returns an unsubscribe function.
 * - unsubscribe(fn): Removes a subscriber.
 * - notify(): Notifies all subscribers.
 * - clear(): Removes all subscribers.
 *
 * The function atom<T>(init: T) is also exported to easily create Atom instances.
 */
export declare class Atom<T> {
  value: T;
  subscribers: Set<() => any>;
  constructor(init: T);
  set(value: T): void;
  get(): T;
  listen(fn: () => any): () => void;
  subscribe(fn: () => any): () => void;
  unsubscribe(fn: () => any): void;
  notify(): void;
  clear(): void;
}
/**
 * Creates a new reactive atom with an initial value.
 *
 * @template T Type of the value stored in the atom.
 * @param {T} init - Initial value of the atom.
 * @returns {Atom<T>} An Atom instance with the provided initial value.
 *
 * @example
 * // Create an atom with initial value 0
 * const count = atom(0);
 * count.subscribe(() => {
 *   console.log('New value:', count.get());
 * });
 * count.set(1); // Prints: New value: 1
 */
export declare const atom: <T>(init: T) => Atom<T>;
