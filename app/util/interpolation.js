import { isNumber } from './Util.js';

/**
 * @param {number} number
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number} The closest number in the specified range to the test number.
 */
export function capToRange(number, min = 0, max = 1) {
  if (!isNumber(number)) return (min + max) / 2;
  if (number <= min) return min;
  if (number >= max) return max;

  return number;
}

export function normalize(number, min = 0, max = 1) {
  return (number - min) / (max - min);
}

export function interpolate(number, inMin = 0, inMax = 1, outMin = 0, outMax = 1) {
  const inVal = capToRange(number, inMin, inMax);
  const normalized = normalize(inVal, inMin, inMax);

  return normalized * (outMax - outMin) + outMin;
}
