/**
 * Subscriber
 * A lightweight publish-subscribe (pub/sub) utility for managing event subscriptions and notifications.
 *
 * @template T The type of value sent to subscribers.
 *
 * @example
 *   const sub = new Subscriber<number>();
 *   const unsubscribe = sub.subscribe((val) => console.log(val));
 *   sub.notify(42); // Logs: 42
 *   unsubscribe(); // Removes the subscription
 */
export class Subscriber<T> {
  /**
   * List of subscriber callback functions.
   * @type {Array<(value: T) => void>}
   */
  private subscribers: ((value: T) => void)[] = [];

  /**
   * Subscribes a callback to be notified when notify() is called.
   * @param {(value: T) => void} callback - Function to call on notification.
   * @returns {() => void} Unsubscribe function to remove the callback.
   */
  subscribe(callback: (value: T) => void) {
    this.subscribers.push(callback);
    return () => {
      this.unsubscribe(callback);
    };
  }

  /**
   * Removes a callback from the list of subscribers.
   * @param {(value: T) => void} callback - The callback to remove.
   */
  unsubscribe(callback: (value: T) => void) {
    this.subscribers = this.subscribers.filter((cb) => cb !== callback);
  }

  /**
   * Notifies all subscribers with the provided value.
   * @param {T} value - The value to send to all subscribers.
   */
  notify(value: T) {
    for (const callback of this.subscribers) {
      callback(value);
    }
  }
}
