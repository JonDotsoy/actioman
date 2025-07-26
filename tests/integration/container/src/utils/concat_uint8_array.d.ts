/**
 * concatUint8Array
 * Concatenates an array of Uint8Array buffers into a single Uint8Array.
 *
 * @param {Uint8Array[]} buffers - An array of Uint8Array buffers to concatenate.
 * @returns {Uint8Array} A new Uint8Array containing the concatenated data from all input buffers.
 *
 * @example
 *   const result = concatUint8Array([buf1, buf2, buf3]);
 */
export declare const concatUint8Array: (buffers: Uint8Array[]) => Uint8Array;
