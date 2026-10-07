import { isNumber } from "./Util.js";

/** @param {number} millis */
export function millisToCssTime(millis) {
  if (!isNumber(millis)) return millis;

  const sec = (millis * 0.001).toFixed(1);
  return `${sec}s`;
}

/**
 * Takes a desired total duration and a single-iterations duration
 * for an animation, returns a duration/iterations pair that
 * closely approximates the desired total duration, minimally
 * adjusting duration.
 *
 * @param {number} desiredTotalDuration in milliseconds
 * @param {number} duration in milliseconds
 * @returns {{duration: number, iterations: number}}
 */
export function fudgeCssAnimationTime(desiredTotalDuration, duration) {
  const initialIterations = desiredTotalDuration / duration;

  let iterations;
  if (Number.isInteger(initialIterations)) {
    iterations = initialIterations;
  } else {
    const lesserCandidateIterations = Math.floor(initialIterations);
    const greaterCandidateIterations = Math.ceil(initialIterations);

    const lesserCandidateDuration = desiredTotalDuration / lesserCandidateIterations;
    const greaterCandidateDuration = desiredTotalDuration / greaterCandidateIterations;

    const lesserRelativeError = Math.abs(lesserCandidateDuration - duration) / duration;
    const greaterRelativeError = Math.abs(greaterCandidateDuration - duration) / duration;

    if (lesserRelativeError < greaterRelativeError) {
      iterations = lesserCandidateIterations;
    } else {
      iterations = greaterCandidateIterations;
    }
  }

  return {
    duration: Math.round(desiredTotalDuration / iterations),
    iterations,
  };
}
