import { randomCentral } from './random.js';

/** @param {HTMLElement} el */
export function getCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/** @param {HTMLElement} el */
export function getRandomSpotOn(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.x + rect.width * randomCentral(3),
    y: rect.y + rect.height * randomCentral(3),
  };
}
