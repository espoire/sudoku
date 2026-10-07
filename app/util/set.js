import { valueAndType } from './debug.js';

/**
 * @template T
 * @param {Set<T>} set
 * @param {T[]?} additions
 */
export function addAll(set, additions) {
  if (additions == null) return;
  if (!Array.isArray(additions)) throw new Error(
    "addAll() expects parameter 'additions' to be an array type. Provided:",
    valueAndType(additions)
  );
  for (let i = 0; i < additions.length; i++) set.add(additions[i]);
}

/**
 * @template T
 * @param {Set<T>} set
 * @returns {T}
 */
export function first(set) {
  return set.values().next().value;
}

/**
 * @template T
 * @param {Set<T>} set
 * @param {(T) => boolean} predicate
 * @returns {boolean}
 */
export function setSome(set, predicate) {
  for (const item of set) {
    if (predicate(item)) return true;
  }
  return false;
}