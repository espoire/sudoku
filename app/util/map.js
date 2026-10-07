/** @fileoverview Utility functions for working with Maps. */

/**
 * Converts a Map into an array of key-value pair objects.
 * @template K,V
 * @param {Map<K,V>} map
 * @return {{key: K, value: V}[]}
 */
export function toKeyValuePairs(map) {
  return Array.from(map, ([key, value]) => ({ key, value }));
}