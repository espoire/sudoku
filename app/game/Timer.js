import GlobalVueProps from "../VueInterface.js";

export default class Timer {
  /** @type {number?} */ startTime = null;
  /** @type {number} */ totalPausesLength = 0;
  /** @type {boolean} */ paused = false;
  /** @type {number?} */ pauseStartTime = null;
  /** @type {number?} */ elapsedTimeAtPause = null;

  /**
   * Starts the timer if it hasn't been started yet.
   * If the timer has already been started, this method does nothing.
   * 
   * Use .pause() and .resume() to control the timer after it has been started.
   * 
   * @param {boolean} updateVue - whether to update the Vue interface after starting the timer
   * @returns {Timer} - the current Timer instance
   */
  start(updateVue = true) {
    if (this.startTime != null) return this;
    this.startTime = performance.now();

    if (updateVue) this.updateVue();
    return this;
  }

  /** @returns {number} */
  getElapsedTime() {
    return Timer.getElapsedTime(this);
  }

  static getElapsedTime({startTime, totalPausesLength, paused = false, elapsedTimeAtPause = null}) {
    if (startTime == null) return 0;
    if (paused && elapsedTimeAtPause != null) return elapsedTimeAtPause;

    const now = performance.now();
    return now - startTime - totalPausesLength;
  }

  pause(updateVue = true) {
    if (this.paused || this.startTime == null) return;
    this.elapsedTimeAtPause = this.getElapsedTime();
    this.paused = true;
    this.pauseStartTime = performance.now();

    if (updateVue) this.updateVue();
  }

  resume(updateVue = true) {
    if (!this.paused || this.pauseStartTime == null) return;
    this.paused = false;
    this.totalPausesLength += performance.now() - this.pauseStartTime;
    this.pauseStartTime = null;
    this.elapsedTimeAtPause = null;

    if (updateVue) this.updateVue();
  }

  static format(millis, includeTenths = true) {
    const totalSeconds = Math.floor(millis / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds - h * 3600) / 60);
    const s = (totalSeconds - h * 3600 - m * 60);
    const tenths = Math.floor((millis % 1000) / 100);

    let formatted;

    if (h > 0) {
      formatted = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else if (m > 0) {
      formatted = `${m}:${s.toString().padStart(2, '0')}`;
    } else {
      formatted = `${s}`;
    }

    if (includeTenths) formatted += `.${tenths}`;
    return formatted;
  }

  updateVue() {
    const vm = GlobalVueProps;
    vm.timer = this.toVue();
  }

  toVue() {
    return {
      startTime: this.startTime,
      totalPausesLength: this.totalPausesLength,
      paused: this.paused,
      elapsedTimeAtPause: this.elapsedTimeAtPause,
    };
  }
}