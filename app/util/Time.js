/** Returns the time in milliseconds
 * since 1970-1-1 0:00.
 *
 * @returns {number}
 */
export function currentTimeMillis() {
  return new Date().valueOf();
}

/**
 * For "asyncifying" a function in a clearer way than setTimeout.
 * Use like: await delay(1000);
 *
 * @param {number?} ms
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
