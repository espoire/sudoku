// Returns a random integer from min to max (inclusive).

import { arrShuffleInPlace, sum } from './Array.js';
import { isNumber } from './Util.js';

// Optionally, may specify a random function to use in place of Math.random();
export function randInt(min, max, randomFunc = Math.random) {
  return Math.floor(randomFunc() * (max - min + 1) + min);
}

export function randIntWeightedLow(min, max, randomFunc = Math.random) {
  return randInt(min, max, () => Math.pow(randomFunc(), 2));
}

export function randIntWeightedHigh(min, max, randomFunc = Math.random) {
  return randInt(min, max, () => Math.sqrt(randomFunc()));
}

// Optionally, may specify a random function to use in place of Math.random();
export function randFloat(min, max, randomFunc = Math.random) {
  const roll = (randomFunc || Math.random)();
  return roll * (max - min) + min;
}

/**
 * 
 * @param {number} min
 * @param {number} max
 * @param {number} weight Strength of the low-weighting. 1 is no weighting, 2 is moderate.
 * @param {() => number} randomFunc Optional RNG function to use in place of Math.random().
 * @returns 
 */
export function randFloatWeightedLow(min, max, weight = 2, randomFunc = Math.random) {
  return randFloat(min, max, () => Math.pow(randomFunc(), weight));
}

export function randBool(probability = 0.5, randomFunc = Math.random) {
  return randomFunc() < probability;
}

/**
 * @param {number} magnitude
 * @param {() => number} [randomFunc]
 * @returns {number} An integer in the range [-magnitude .. +magnitude], inclusive.
 */
export function randomPlusOrMinusIntRange(magnitude, randomFunc = Math.random) {
  return randInt(-magnitude, magnitude, randomFunc);
}

/** Generates normally-distributed random numbers. Very approximate.
 *
 * | % of Returns | Central X% |
 * | ------------ | ---------- |
 * |        25    |        8.5 |
 * |        50    |       17.9 |
 * |        66    |       25   |
 * |        95    |       50   |
 * |        99.85 |       75   |
 * |       100    |      100   |
 *
 * @param {number} stDev
 * @param {number} mean
 * @param {() => number} randomFunc
 * @returns {number} In the range (5 * stDev * [-1 .. 1] + mean). 95% of returned values fall in the central 50%: the range (2.5 * stDev * [-1 .. 1] + mean).
 */
export function bellRandom(stDev = 1.0, mean = 0.0, randomFunc = Math.random) {
  const rolls = [];

  for (let i = 0; i < 5; i++) {
    const roll = (randomFunc || Math.random)();
    rolls.push(roll * 2 - 1);
  }

  return (sum(rolls) * stDev) + mean;
}

/**
 * @template T
 * @param {T[]} inArray  The array to pick from.
 * @param {() => number} [randomFunc] (optional) RNG function to use. Defaults to Math.random.
 * @returns {T}  A random element from a provided array
 */
export function randomArrayElement(inArray, randomFunc) {
  return inArray[randInt(0, inArray.length - 1, randomFunc)];
}

/**
 * @template T
 * @param {T[]} array
 * @param {number} sampleSize
 * @param {() => number} randomFunc
 * @returns {T[]}
 */
export function randomArraySample(array, sampleSize, randomFunc) {
  const ret = [];

  for (let i = 0; i < sampleSize; i++) {
    const index = randInt(0, array.length - 1, randomFunc);
    ret.push(array[index]);
  }

  return ret;
}

/**
 * @template T
 * @param {T[]} array
 * @param {number} sampleSize
 * @param {() => number} randomFunc
 * @returns {T[]}
 */
export function randomArraySampleWithoutReplacement(array, sampleSize, randomFunc = Math.random) {
  if (!isNumber(sampleSize)) throw new Error('sampleSize must be a number.');

  if (sampleSize < 1) return [];

  const copy = [...array]; // Copy to avoid mutating the input array.

  const leftover = sampleSize - array.length;
  if (leftover >= 0) {
    // Need to return the whole array, in random order.
    arrShuffleInPlace(copy, randomFunc);
    return copy;
  }

  const ret = randomArraySampleWithoutReplacement(array, leftover, randomFunc);
  for (let i = 0; i < sampleSize; i++) {
    const index = randInt(0, copy.length - 1, randomFunc);

    ret.push(copy[index]);
    copy.splice(index, 1);
  }

  return ret;
}

/**
 * Selects a random index from a list of weights.
 * P(x) = weights[x] / sum(weights)
 * 
 * @param {number[]} weights The list of whole-number weights to choose from.
 * @param {() => number} randomFunc
 * @returns {number} The index of the selected weight.
 */
export function weightedRandom(weights, randomFunc) {
  let roll = randInt(1, sum(weights), randomFunc);

  let i = 0;
  for (const weight of weights) {
    roll -= weight;
    if (roll <= 0) return i;
    i++;
  }

  return i;
}

/**
 * @template T
 * @param {T[]} inArray
 * @param {number[]} weights The list of whole-number weights to choose from.
 * @param {() => number} randomFunc
 * @returns {T}
 */
export function weightedRandomArrayElement(inArray, weights, randomFunc) {
  return inArray[weightedRandom(weights, randomFunc)];
}

export function weightedRandomArraySample(array, weights, sampleSize, randomFunc) {
  const ret = [];

  for (let i = 0; i < sampleSize; i++) {
    ret.push(weightedRandomArrayElement(array, weights, randomFunc));
  }

  return ret;
}

export function weightedRandomArraySampleWithoutReplacement(
  array,
  weights,
  sampleSize,
  randomFunc
) {
  const ret = [];

  for (let i = 0; i < sampleSize; i++) {
    const index = weightedRandom(weights, randomFunc);

    ret.push(array[index]);
    array.splice(index, 1);
    weights.splice(index, 1);
  }

  return ret;
}

// roundRandom - Rounds a number to a nearby integer, randomly.
//   Example: 1.2 will become either 1 or 2. 80% will be 1, 20% will be 2.
export function roundRandom(amount, randomFunc) {
  const roll = (randomFunc || Math.random)();

  if (roll < amount % 1) {
    return Math.ceil(amount);
  } else {
    return Math.floor(amount);
  }
}

/** Gets an unevenly-distributed random number in the range [0 .. 1]
 * 0 and 1 are least likely, and 0.5 is most likely.
 *
 * @param {() => number} randomFunc
 * @returns {number} In the range [0 .. 1]
 */
export function randomCentral(weighting = 2, randomFunc = Math.random) {
  let total = 0;
  for (let i = 0; i < weighting; i++) total += randomFunc();
  return total / weighting;
}

export function randomSign(randomFunc = Math.random) {
  return randBool(0.5, randomFunc) ? 1 : -1;
}

/**
 * @param {number[]} desiredResults
 */
export function getRiggedRandomFunction(desiredResults) {
  const results = structuredClone(desiredResults);
  let i = 0;

  return function riggedRandom() {
    const ret = results[i++];
    i %= results.length;
    return ret;
  };
}

export class SeededRandomGenerator {
  static #instanceCount = 0;

  /** @type {number} */
  #seed;
  /** @type {number} */
  #peekSeed;
  /** @type {(seed?: number) => number} */
  next;
  /** @type {(steps?: number) => number} */
  peek;

  constructor(seed) {
    if (seed == null) {
      seed =
          Date.now() +   // Get some entropy from the current time
          SeededRandomGenerator.#instanceCount++;   // Protect against duplicate seeds caused by rapid/bulk instantiation
    }

    this.#seed = seed;
    this.#peekSeed = seed;
    this.next = this.#next.bind(this); // For easy passing to other functions in this file
    this.peek = this.#peek.bind(this); // For easy passing to other functions in this file
  }

  setSeed(newSeed) {
    this.#seed = newSeed;
    this.#peekSeed = newSeed;
    return this.next;
  }

  resetPeek() {
    this.#peekSeed = this.#seed;
  }

  #next(seed) {
    if (seed != null) {
      // If given a new seed, use it
      this.setSeed(seed);

    } else {
      // Advance the seed by a fixed increment
      this.setSeed(this.#seed + 1831565813);
    }
  
    return this.#rng(this.#seed);
  }

  #peek(steps = 1) {
    // Advance the peek seed by a fixed increment
    this.#peekSeed += 1831565813 * steps;
    return this.#rng(this.#peekSeed);
  }

  #rng(x) {
    // Mix bits using XOR and multiplication (avalanche effect)
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);

    // Final scramble and normalize to [0, 1)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }
}