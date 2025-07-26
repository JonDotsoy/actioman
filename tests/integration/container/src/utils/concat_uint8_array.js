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
export const concatUint8Array = (buffers) => {
  // Calculate total length
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  // Create a new Uint8Array with the total length
  const result = new Uint8Array(totalLength);
  // Copy each buffer into the result array
  let offset = 0;
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
};
