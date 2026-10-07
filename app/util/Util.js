export function padStringLeft(string, length) {
  while (string.length < length) string = ' ' + string;
  return string;
}

export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number} The closest number in the range [min .. max] to the target value.
 */
export function clamp(v, min, max) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

/**
 * @param {number} v
 * @param {number} domainMin
 * @param {number} domainMax
 * @param {number} rangeMin
 * @param {number} rangeMax
 * @returns {number}
 */
export function interpolate(v, domainMin, domainMax, rangeMin, rangeMax) {
  const domainRatio = (v - domainMin) / (domainMax - domainMin);
  const normalized = clamp(domainRatio, 0, 1);
  return normalized * (rangeMax - rangeMin) + rangeMin;
}

/** Repeates the provided callback function the
 * specified number of times.
 *
 * Optionally, the callback may make use of the
 * looping variable, counting up through the
 * range [0 .. times).
 *
 * @param {number} times
 * @param {(i: number) => *} fn
 * @returns {*[]}
 *   An array containing any non-undefined values
 *     returned from the callback, in order.
 */
export function repeat(times, fn) {
  const ret = [];

  for (let i = 0; i < times; i++) {
    const v = fn(i);
    if (v !== undefined) ret.push(v);
  }

  return ret;
}

export class Point2D {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  getX() {
    return this.#x;
  }
  getY() {
    return this.#y;
  }

  /**
   * @param {Point2D} that
   * @returns {boolean}
   */
  equals(that) {
    return this.#x == that.#x && this.#y == that.#y;
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.toIdString();
  }

  /**
   * @returns {string}
   */
  toIdString() {
    return `${this.#x},${this.#y}`;
  }
}

export class Point3D {
  constructor(x, y, z) {
    if (typeof x !== 'number')
      throw new Error('Cannot create Point3D with non-number x-coordinate: ', x);
    if (typeof y !== 'number')
      throw new Error('Cannot create Point3D with non-number y-coordinate: ', y);
    if (typeof z !== 'number')
      throw new Error('Cannot create Point3D with non-number z-coordinate: ', z);

    this.x = x;
    this.y = y;
    this.z = z;

    Object.freeze(this);
  }

  /**
   * @param {Point3D} that
   * @returns {boolean}
   */
  equals(that) {
    return this.x == that.x && this.y == that.y && this.z == that.z;
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.toIdString();
  }

  /**
   * @returns {string}
   */
  toIdString() {
    return '[Point3D: ' + this.x + ',' + this.y + ',' + this.z + ']';
  }
}

/**
 * @template T
 */
export const GeneralSet = (function () {
  function toIdString(item) {
    if (item && typeof item.toIdString === 'function') return item.toIdString();
    return item + '';
  }

  class GeneralSet {
    /** @type {number} */ size = 0;
    /** @type {Map<string, T>} */ map = new Map();

    /**
     * @param {T} item
     */
    add(item) {
      this.map.set(toIdString(item), item);
      this.size = this.map.size;
    }

    /**
     * @param {T[]} array
     */
    addAll(array) {
      for (const element of array) this.add(element);
    }

    values() {
      return this.map.values();
    }

    /** @returns {T} */
    getFirst() {
      return this.getIndex(0);
    }

    /**
     * @param {number} index
     * @returns {T}
     */
    getIndex(index) {
      const values = this.values();

      for (let i = 0; i < index; i++) values.next();

      return values.next().value;
    }

    /**
     * @returns {T[]}
     */
    toArray() {
      let ret = [];

      const values = this.values();
      for (let i = values.next(); !i.done; i = values.next()) ret.push(i.value);

      return ret;
    }

    /**
     * @param {T} item
     * @returns {boolean} True if an item was removed.
     */
    delete(item) {
      const ret = this.map.delete(toIdString(item));
      this.size = this.map.size;
      return ret;
    }

    clear() {
      for (const element of this.values()) this.delete(element);
    }

    /**
     * @param {T} item
     * @returns {boolean}
     */
    has(item) {
      return this.map.has(toIdString(item));
    }

    forEach(callbackFn, thisArg) {
      this.map.forEach(callbackFn, thisArg);
    }
  }

  GeneralSet.prototype[Symbol.iterator] = GeneralSet.prototype.values;

  return GeneralSet;
})();

/** Recursively applies Object.freeze to array and object children.
 * @param {*} obj
 */
export function deepFreeze(obj) {
  if (Array.isArray(obj)) {
    Object.freeze(obj);
    for (const element of obj) {
      deepFreeze(element);
    }
  } else if (typeof obj === 'object') {
    Object.freeze(obj);
    for (const key in obj) {
      deepFreeze(obj[key]);
    }
  }
}

export function logInDev(...messages) {
  if (!environmentIsDev()) return;
  console.log(...messages);
}

export function warnInDev(...warnings) {
  if (!environmentIsDev()) return;
  console.warn(...warnings);
}

export function errorInDev(...errors) {
  if (!environmentIsDev()) return;
  console.error(...errors);
}

/**
 * Throws an error in development mode or logs it in production mode.
 * @param  {...Stringable} errors
 */
export function errorOrThrow(...errors) {
  if (environmentIsDev()) {
    throw new Error(errors.join(' '));
  } else {
    console.error(...errors);
  }
}

export function warnOrThrow(...warnings) {
  if (environmentIsDev()) {
    throw new Error(warnings.join(' '));
  } else {
    console.warn(...warnings);
  }
}

export function warnAfterDate(date, ...warnings) {
  if (new Date() > date) warnInDev(...warnings);
}

export function environmentIsDev() {
  return window.origin.startsWith('http://localhost') || window.origin.includes('127.0.0.1') || window.origin.includes('192.168.');
}

// credit to Timothy Huang for this regex test:
// https://dev.to/timhuang/a-simple-way-to-detect-if-browser-is-on-a-mobile-device-with-javascript-44j3
const mobileUserAgentRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function educatedGuessIfEnvironmentIsMobile() {
  // Not yet widely-supported 11/2023, but once it is, this will be the best way to detect.
  if (navigator.userAgentData && 'mobile' in navigator.userAgentData)
    return navigator.userAgentData.mobile;

  let evidence = 0;

  // Inconclusive if false; some browsers or OSs report "untruthfully".
  // (Setting is user-configurable, and therefore allowed to be any string.)
  if (mobileUserAgentRegex.test(navigator.userAgent)) {
    evidence++;
  } else {
    evidence--;
  }

  // Screen size
  if (window.matchMedia('(max-width: 767px)').matches) {
    evidence++;
  } else {
    evidence--;
  }

  // Pixel density
  if (window.devicePixelRatio > 1.5) {
    evidence++;
  } else {
    evidence--;
  }

  // Touch
  if ('ontouchstart' in window) {
    evidence++;
  } else {
    evidence--;
  }

  // Device's main pointer has a precise location
  if (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(pointer: none)').matches
  ) {
    evidence++;
  } else {
    evidence--;
  }

  // Device's main pointer is able to hover conveniently
  if (window.matchMedia('(hover: none)').matches) {
    evidence++;
  } else {
    evidence--;
  }

  return evidence > 0;
}

export const TAU = 2 * Math.PI;
export const EPSILON = 1e-10;
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function sineDeg(degrees) {
  return Math.sin(degrees * DEG2RAD);
}
export function cosineDeg(degrees) {
  return Math.cos(degrees * DEG2RAD);
}
export function tangentDeg(degrees) {
  return Math.tan(degrees * DEG2RAD);
}
export function arctangentDeg(ratio) {
  return Math.atan(ratio) * RAD2DEG;
}

export function isNumber(x) {
  return typeof x === 'number' && !isNaN(x);
}

export function isZero(x) {
  return x === 0;
}

export function not(fn) {
  return function not(...args) {
    return !fn(...args);
  };
}

/**
 * "Nullish" refers variously to null, undefined, empty, and similar special
 * value types, all of which return true from the == null comparison.
 *
 * Notably, the Number NaN (not-a-number) is NOT nullish.
 */
export function nullish(x) {
  return x == null;
}

export function truthy(x) {
  return !!x;
}

export function echo(x) {
  return x;
}
