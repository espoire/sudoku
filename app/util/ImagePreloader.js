import { ensureArray } from './Array.js';

export default class ImagePreloader {
  /** @type {Map<string, HTMLImageElement>} */
  static #cache = new Map();

  /**
   * @param {string | string[]} src
   */
  static preload(src) {
    const srcs = ensureArray(src);
    for (const s of srcs) {
      // Check map to avoid double-cache
      if (!ImagePreloader.#cache.has(s)) {
        const img = new Image();
        img.src = s;

        // Keep a reference to prevent garbage collect
        ImagePreloader.#cache.set(s, img);
      }
    }
  }
}
