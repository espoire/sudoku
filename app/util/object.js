import { sum } from "./Array.js";
import { isNumber } from "./Util.js";

export function keys(objectMaybe) {
  if (objectMaybe == null || typeof objectMaybe !== "object") return [];
  return Object.keys(objectMaybe);
}

export function values(objectMaybe) {
  if (objectMaybe == null || typeof objectMaybe !== "object") return [];
  return Object.values(objectMaybe);
}

/**
 * @param {*} objectMaybe
 * @returns {boolean} True if the object is exactly {} (or equivalent from Object.create(null)), false otherwise.
 */
export function isEmptyObject(objectMaybe) {
  if (objectMaybe == null || typeof objectMaybe !== "object") return false;

  const proto = Object.getPrototypeOf(objectMaybe);
  if (proto !== Object.prototype && proto !== null) return false;

  return Object.keys(objectMaybe).length === 0;
}

/** Invokes `eachFn` on all keys in `obj`.
 *
 * @template Orig, Mapped
 * @param {Record<*,Orig>} obj
 * @param {(value: Orig, key: *) => Mapped?} eachFn
 * @returns {Mapped[]}
 */
export function forEachKey(obj, eachFn) {
  const ret = [];

  for (const key in obj) {
    const v = eachFn(obj[key], key);
    if (v !== undefined) ret.push(v);
  }

  return ret;
}

/** Creates a new object with all keys from `obj`, and all
 * values replaced with the return value from calling `mapFn`.
 *
 * @template Orig, Mapped
 * @param {Record<*,Orig>} obj
 * @param {(value: Orig, key: *) => Mapped} mapFn
 * @returns {Record<*,Mapped>}
 */
export function mapKeys(obj, mapFn) {
  const ret = {};
  for (const key in obj) ret[key] = mapFn(obj[key], key);
  return ret;
}

/**
 * Filters the keys of an object based on a predicate function.
 *
 * @template K, V
 * @param {Record<K,V>} obj
 * @param {(value: V, key: K) => boolean} filterFn
 * @returns {Record<K,V>} A new object containing only the keys that passed the filter function.
 */
export function filterKeys(obj, filterFn) {
  const ret = {};

  for (const key in obj) {
    if (filterFn(obj[key], key)) {
      ret[key] = obj[key];
    }
  }

  return ret;
}

/**
 * Returns the key in the object corresponding to the largest numeric value.
 * If the object is empty or contains no numeric values, returns null.
 * If multiple keys are tied for the largest numeric value, returns this earliest in interation order.
 * 
 * @param {*} obj The object to search for the maximum value.
 * @returns {string?} The key corresponding to the largest numeric value, or null if none found.
 */
export function maxKey(obj) {
  let key = null;
  let maxValue = -Infinity;

  for (const k in obj) {
    const v = obj[k];
    if (typeof v === 'number' && v > maxValue) {
      maxValue = v;
      key = k;
    }
  }

  return key;
}

/**
 * @param {Object} obj
 * @returns {number} The sum of all numeric values in the object.
 */
export function sumKeys(obj) {
  return sum(values(obj).filter(isNumber));
}

/** Copies all keys in the source object into the target object, mutating
 * the target. Nullish values are treated as if the key were not present.
 *
 * @param {object} target The object to mutate.
 * @param {object} source The source object from which to copy values.
 * @param {(targetValue: *, sourceValue: *) => *} [keyConflictFn]
 *    A function to resolve cases where the target object already contains
 *    data at a key specified by the source object. If not provided, the
 *    default behavior is to overwrite values in the target object.
 * @return {object} The mutated target object.
 */
export function mergeObjects(target, source, keyConflictFn = mergeObjectsConflictFns.overwrite) {
  for (const key in source) {
    const sourceValue = source[key];
    if (sourceValue == null) continue;

    const targetValue = target[key];

    if (targetValue == null) {
      if (typeof sourceValue === 'object') {
        target[key] = structuredClone(sourceValue);
      } else {
        target[key] = sourceValue;
      }
    } else {
      target[key] = keyConflictFn(targetValue, sourceValue);
    }
  }

  return target;
}

export const mergeObjectsConflictFns = {
  add(targetValue, sourceValue) {
    return targetValue + sourceValue;
  },

  overwrite(targetValue, sourceValue) {
    return sourceValue;
  },

  mergeObjectsElseKeepTarget(targetValue, sourceValue) {
    if (typeof targetValue === 'object' && typeof sourceValue === 'object') {
      mergeObjects(targetValue, sourceValue, mergeObjectsConflictFns.mergeObjectsElseKeepTarget);
    }

    return targetValue;
  },

  mergeObjectsElseOverwrite(targetValue, sourceValue) {
    if (typeof targetValue === 'object' && typeof sourceValue === 'object') {
      mergeObjects(targetValue, sourceValue, mergeObjectsConflictFns.mergeObjectsElseOverwrite);
      return targetValue;
    }

    return sourceValue;
  },

  /**
   * @param {*[]} targetValue
   * @param {*[]} sourceValue
   */
  concatenateArrays(targetValue, sourceValue) {
    if (isIterable(sourceValue)) {
      targetValue.push(...sourceValue);
    } else {
      targetValue.push(sourceValue);
    }

    return targetValue;
  },
};

/** Fetches an element from within a POJO object.
 * Similar to using the syntax obj[key], except if
 * key contains one or more dots (.) then it will
 * be treated as nested keys within a multi-level
 * object. If any intermediate keys are nullish,
 * that nullish value will be returned early.
 *
 * @param {object} obj
 *      The object from which to retrieve a key.
 * @param {!string} key
 *      The key to retrieve from the object.
 * @param {boolean} [tryForNonObject=false]
 *      Optional ovverride to attempt dereference
 *      on non-object types (e.g. a class and its
 *      static members, typeof class === 'function').
 *
 * @return {any}
 */
export function dereference(obj, key, tryForNonObject = false) {
  if (!obj || (typeof obj !== 'object' && !tryForNonObject)) return obj;
  if (!key.includes('.')) return obj[key];

  const tokens = key.split('.');
  for (const token of tokens) {
    obj = obj[token];
    if (obj == null) return obj;
  }

  return obj;
}

export function deepSet(obj, key, newValue, createMissing = false) {
  if (obj == null) return;
  if (typeof obj !== 'object') return;
  if (!key.includes('.')) return (obj[key] = newValue);

  const tokens = key.split('.');
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];

    if (obj[token] == null) {
      if (createMissing) {
        obj[token] = {};
      } else {
        return;
      }
    }

    obj = obj[token];
  }

  key = tokens[tokens.length - 1];
  obj[key] = newValue;
}

export function deepIncrement(obj, key, delta = 1) {
  if (obj == null) return;
  if (typeof obj !== 'object') return;
  if (!key.includes('.')) return (obj[key] = (obj[key] || 0) + delta);

  const tokens = key.split('.');
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    obj = obj[token];
    if (obj == null) return;
  }

  key = tokens[tokens.length - 1];
  return (obj[key] = (obj[key] || 0) + delta);
}

export function deepExists(obj, key) {
  if (obj == null) return false;
  if (typeof obj !== 'object') {
    if (!key) return !!obj;
    return false;
  }
  if (!key.includes('.')) return obj[key] != null;

  const tokens = key.split('.');
  for (const token of tokens) {
    obj = obj[token];
    if (obj == null) return false;
  }

  return obj != null;
}

/** Creates a deep clone of the provided value.
 * Only Arrays and simple objects are duplicated;
 * all other value types are copied only if their
 * simple assignment (=) produces a copy.
 *
 * For most use cases, the JS native structuredClone() is preferred!
 * 
 * Do use for:
 * - Getting a plain-old object copy of a Vue.js reactive proxy.
 *
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export function deepClone(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    const ret = new Array(obj.length);
    for (let i = 0; i < obj.length; i++) {
      ret[i] = deepClone(obj[i]);
    }
    return ret;
  }

  const ret = Object.create(null);
  for (const key in obj) {
    ret[key] = deepClone(obj[key]);
  }
  return ret;
}

/**
 * Compares two values for deep equality.
 * Only supports primitives, plain objects with iterable non-Symbol keys, compact arrays, all without any cyclic references.
 * Does not support functions, classes, or other complex types -- do not use; return value not guaranteed for these.
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function deepEquals(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false; // For our purposes, null and undefined are not equal.
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  // If we have two arrays, interate and compare their contents.
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEquals(a[i], b[i])) return false;
    }
    return true;
  }

  // If we have two objects, iterate by keys and compare their contents.
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEquals(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Checks if the provided value is a plain object.
 * Should exclude arrays, functions, and other complex types.
 * @param {*} obj
 * @returns {boolean}
 */
function isPlainObject(obj) {
  if (obj == null || typeof obj !== 'object') return false;
  const proto = Object.getPrototypeOf(obj);
  return proto === Object.prototype || proto === null;
}

export function isIterable(obj) {
  if (obj == null) return false;
  return typeof obj[Symbol.iterator] === 'function';
}

/**
 * @param {*} obj The object or array to map.
 * @param {string} [currentPath]
 * @returns {string[]} A list of valid deep keys within the object, as used by something like dereference() or deepSet().
 */
export function enumerateDeepKeys(obj, currentPath = '') {
  if (!obj || typeof obj !== 'object') return null;
  const ret = [];
  if (currentPath.length) currentPath += '.';

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const innerKeys = enumerateDeepKeys(obj[i]);
      if (innerKeys == null) {
        ret.push(`${currentPath}${i}`);
      } else {
        ret.push(...innerKeys.map(subkey => `${currentPath}${i}.${subkey}`));
      }
    }
  } else {
    for (const key in obj) {
      const innerKeys = enumerateDeepKeys(obj[key]);
      if (innerKeys == null) {
        ret.push(`${currentPath}${key}`);
      } else {
        ret.push(...innerKeys.map(subkey => `${currentPath}${key}.${subkey}`));
      }
    }
  }

  return ret;
}

/**
 * @param {Object} obj
 * @param {string} key
 * @returns {boolean}
 */
export function hasKey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Checks if the provided object has any (enumerable) keys.
 * @param {Object} obj
 * @returns {boolean}
 */
export function hasKeys(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

/**
 * @template T
 * @param {Record<string, T>} obj
 * @param {T | ((value: T, key: string) => boolean)} valueOrTestFn
 * @returns {string?} The first key found whose value matches the given value or test function, or null if none found.
 */
export function findKey(obj, valueOrTestFn) {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof valueOrTestFn === 'function') {
      if (valueOrTestFn(value, key)) return key;
    } else {
      if (value === valueOrTestFn) return key;
    }
  }
  return null;
}