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

/**
 * Checks if two sets are equal by comparing their sizes and elements.
 * @template T
 * @param {Set<T> | Array<T>} a
 * @param {Set<T> | Array<T>} b
 * @returns {boolean}
 */
export function setEquals(a, b) {
  if (Array.isArray(a)) a = new Set(a);
  if (Array.isArray(b)) b = new Set(b);

  if (a.size !== b.size) return false;
  return a.isSubsetOf(b);
}