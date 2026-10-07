/**
 * @param {{ x: number, y: number }} p1
 * @param {{ x: number, y: number }} p2
 * @returns {number}
 */
export function distance(p1, p2) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * @param {{ x: number, y: number }} p1
 * @param {{ x: number, y: number }} p2
 * @returns {number}
 */
export function dotProduct(p1, p2) {
  return p1.x * p2.x + p1.y * p2.y;
}