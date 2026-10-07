export default class BodyBackgroundColorPulseAnimator {
  static #brightenDuration = 50;
  static #fullBrightnessDuration = 0;
  static #darkenDuration = 250;

  static get brightenDuration() {
    return this.#brightenDuration;
  }

  static get fullAnimationDuration() {
    return this.#brightenDuration + this.#fullBrightnessDuration + this.#darkenDuration;
  }

  /**
   * @param {string} color A CSS color selector, like "white" or "#FFF"
   * @param {number} delay Delay in milliseconds before the pulse starts
   */
  static pulse(color, delay = 50) {
    let netDelay = delay - this.#brightenDuration;

    if (netDelay > 0) {
      setTimeout(() => this.#applyPulse(color), netDelay);
    } else {
      this.#applyPulse(color);
    }

    setTimeout(() => this.#clearPulse(), delay + this.#fullBrightnessDuration);
  }

  static #applyPulse(color) {
    const style = document.querySelector('body').style;
    style.transition = `background-color 0.05s`;
    style.backgroundColor = color;
  }

  static #clearPulse() {
    const style = document.querySelector('body').style;
    style.transition = `background-color 0.25s`;
    style.backgroundColor = null;
  }
}
