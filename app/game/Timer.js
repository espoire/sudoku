import GlobalVueProps from "../VueInterface.js";

export default class Timer {
  /** @type {number} */ initialTime = 0;
  /** @type {number?} */ startTime = null;
  /** @type {number} */ totalPausesLength = 0;
  /** @type {boolean} */ paused = false;
  /** @type {number?} */ pauseStartTime = null;
  /** @type {number?} */ elapsedTimeAtPause = null;
  /** @type {boolean} */ stopped = false;

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
    if (this.startTime != null || this.stopped) return this;
    this.startTime = performance.now();

    if (updateVue) this.updateVue();
    return this;
  }

  /**
   * Permanently stops the timer.
   * Once stopped, a timer ignores future start, pause, and resume commands,
   * until and unless it is reset.
   * 
   * @param {*} updateVue 
   */
  stop(updateVue = true) {
    this.pause(false);
    this.stopped = true;

    if (updateVue) this.updateVue();
  }

  reset() {
    this.startTime = null;
    this.totalPausesLength = 0;
    this.paused = false;
    this.pauseStartTime = null;
    this.elapsedTimeAtPause = null;
    this.stopped = false;

    this.updateVue();
  }

  restart() {
    this.reset();
    this.start();
  }

  setInitialTime(time) {
    this.initialTime = time;
  }

  /** @returns {number} The elapsed time in milliseconds. */
  getElapsedTime() {
    return Timer.getElapsedTime(this);
  }

  /**
   * Gets the elapsed time for the given timer state.
   * @returns {number} The elapsed time in milliseconds.
   */
  static getElapsedTime({startTime, initialTime = 0, totalPausesLength, paused = false, elapsedTimeAtPause = null}) {
    if (startTime == null) return 0;
    if (paused && elapsedTimeAtPause != null) return elapsedTimeAtPause;

    const now = performance.now();
    return now - startTime - totalPausesLength + initialTime;
  }

  /**
   * Pauses the timer if it is currently running.
   * Does nothing if the timer is already paused, stopped, or hasn't been started.
   */
  pause(updateVue = true) {
    if (this.paused || this.stopped || this.startTime == null) return;
    this.elapsedTimeAtPause = this.getElapsedTime();
    this.paused = true;
    this.pauseStartTime = performance.now();

    if (updateVue) this.updateVue();
  }

  /**
   * Ends a pause and resumes the timer if it was paused.
   * Does *not* resume from a stop; a stopped timer must be reset and started again, instead.
   */
  resume(updateVue = true) {
    if (!this.paused || this.stopped || this.pauseStartTime == null) return;
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
    } else {
      formatted = `${m}:${s.toString().padStart(2, '0')}`;
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
      initialTime: this.initialTime,
      totalPausesLength: this.totalPausesLength,
      paused: this.paused,
      elapsedTimeAtPause: this.elapsedTimeAtPause,
    };
  }
}