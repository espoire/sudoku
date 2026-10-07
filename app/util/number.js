import { environmentIsDev, EPSILON } from './Util.js';
import { valueAndType } from './debug.js';

/** Large number formatter.
 * Converts large integers like 1234567 to user-readable '1.2M' notation.
 *
 * Minor edit of nFormatter (https://stackoverflow.com/a/9462382)
 * by Salman A (https://stackoverflow.com/users/87015/salman-a)
 *
 * @param {number} num
 * @param {number} [decimalPlaces]
 * @returns {string}
 */
export function formatLargeNumber(num, decimalPlaces = 1) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast(item => num >= item.value);
  return item ?
      (num / item.value).toFixed(decimalPlaces).replace(regexp, '').concat(item.symbol)
    : '0';
}

function formatLargeNumberTest() {
  const tests = [
    { num: 0, digits: 1, expected: '0' },
    { num: 12, digits: 1, expected: '12' },
    { num: 1234, digits: 1, expected: '1.2k' },
    { num: 100000000, digits: 1, expected: '100M' },
    { num: 299792458, digits: 1, expected: '299.8M' },
    { num: 759878, digits: 1, expected: '759.9k' },
    { num: 759878, digits: 0, expected: '760k' },
    { num: 123, digits: 1, expected: '123' },
    { num: 123.456, digits: 1, expected: '123.5' },
    { num: 123.456, digits: 2, expected: '123.46' },
    { num: 123.456, digits: 4, expected: '123.456' },
  ];

  tests.forEach(test => {
    const actual = formatLargeNumber(test.num, test.digits);
    const expected = test.expected;

    if (actual !== expected) {
      console.error(
        `Test formatLargeNumber(${test.num}, ${test.digits}) failed. Actual: ${valueAndType(actual)}. Expected: ${valueAndType(expected)}.`
      );
    }
  });
}

// TODO move into standard testing system
if (environmentIsDev()) formatLargeNumberTest();

/**
 * @param {number}n The original number
 * @param {number} x The group size
 * @returns {number} The remainder of n divided by x, but always positive
 */
export function realModulus(n, x) {
  return ((n % x) + x) % x;
}

export function isEven(n) {
  return n % 2 === 0; // === 0 does in fact permit -0 too, as intended.
}

export function isOdd(n) {
  return n % 2 !== 0;
}

export function isInteger(n) {
  return Number.isInteger(n);
}

export function isWholeNumber(n) {
  return isInteger(n) && n >= 0;
}

/** Checks if a value is a number >= 0 */
export function isPositiveNumber(n) {
  return typeof n === 'number' && n >= 0;
}

const namedFractions = {
  [1/2]: 'half',
  [1/3]: 'one third',
  [2/3]: 'two thirds',
  [1/4]: 'one quarter',
  [3/4]: 'three quarters',
  [1/5]: 'one fifth',
  [2/5]: 'two fifths',
  [3/5]: 'three fifths',
  [4/5]: 'four fifths',
};
/**
 * @param {number} n
 * @returns {string?} A human-readable fraction name of n (e.g. 'half' for 0.5, 'third' for 0.333..., 'two thirds' for 0.666..., etc.) or undefined if no simple name exists.
 */
export function fractionNameOf(n) {
  return namedFractions[n];
}

/**
 * Checks if two floating point numbers are ~equal.
 * Optionally may specify tolerance range, defaulting to 1e-10.
 * 
 * @param {number} a
 * @param {number} b
 * @param {number} tolerance
 * @returns {boolean}
 */
export function approximatelyEqual(a, b, tolerance = EPSILON) {
  return Math.abs(a - b) <= tolerance;
}