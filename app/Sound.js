import './lib/howler.core.min.js';
import Settings from './Settings.js';
import { clamp } from './util/Util.js';

const Howl = window.Howl;
const routePrefix = '/sudoku';
const soundDir = `${routePrefix}/sounds`;
const defaultFileExt = '.wav';

/** @type {Record<string, Sound>} */
const registeredSounds = {};

export default class Sound {
  /**
   * @param {string} name
   * @returns {Sound?}
   */
  static lookup(name) {
    if (registeredSounds[name]) {
      return registeredSounds[name];
    } else {
      console.warn('Sound not found:', name);
      return null;
    }
  }

  static play(fileName, config = {}) {
    const filePath = _path(fileName);
    new Howl({
      src: filePath,
      ...config,
    }).play();
  }

  /** @type {string} */
  path;
  /** @type {string} */
  category;
  /** @type {Howl} */
  howlBehind;
  /** @type {Record<string, *>} */
  config;

  /**
   * @param {string} src
   * @param {string} category
   * @param {*} config
   */
  constructor(src, category, config = {}) {
    if (src == null) return; // Allow empty constructor for clone construction

    this.path = _path(src);
    this.category = category;
    this.howlBehind = null;
    this.config = config;

    this.register(src);
  }

  register(src) {
    const name = src.split('.')[0]; // Remove file extension
    if (registeredSounds[name]) {
      console.warn('Sound already registered:', name);
    } else {
      registeredSounds[name] = this;
    }
  }

  clone() {
    const cloned = new Sound();
    cloned.path = this.path;
    cloned.category = this.category;
    cloned.howlBehind = null;
    cloned.config = { ...this.config };
    return cloned;
  }

  shouldPlay() {
    const setting = Settings.user.sound[this.category];

    if (setting == null) {
      console.warn(
        'Sound category not set to a valid category for sound:',
        this.path,
        'category:',
        this.category
      );
    }

    return setting;
  }

  load() {
    if (this.howlBehind) return;
    this.howlBehind = new Howl({ src: this.path, ...this.config });
  }

  /**
   * @param {*} config 
   * @returns A new Sound instance with the specified modifications applied relative to the current Sound instance. E.g. multiplicative volume/rate changes.
   */
  with(config = {}) {
    const cloned = this.clone();
    cloned.config = Sound.#mergeHowlConfigs(cloned.config, config);
    return cloned;
  }

  static multiplicativeMergeConfigKeys = new Set(['volume', 'rate']);
  static #mergeHowlConfigs(baseConfig, overrideConfig) {
    const merged = { ...baseConfig };

    for (const [key, value] of Object.entries(overrideConfig)) {
      if (Sound.multiplicativeMergeConfigKeys.has(key) && typeof value === 'number' && typeof merged[key] === 'number') {
        merged[key] = merged[key] * value;
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  play(config = {}) {
    if (!this.shouldPlay()) return;
    this.load();
    this.howlBehind.loop(false);
    this.#play(config);
  }

  #play(config = {}) {
    let volume = (config.volume || 1) * (this.config.volume || 1);
    this.howlBehind.volume(volume);

    let rate = config.rate || this.config.rate || 1.0;
    if (config.rateJitter != null) {
      rate = clamp(rate + _jitter(config.rateJitter), 0.05, 10);
    }
    this.howlBehind.rate(rate);

    this.howlBehind.play();
  }

  loop(config = {}) {
    this.load();
    this.howlBehind.loop(true);
    this.#play(config);
  }

  stop() {
    this.load();
    this.howlBehind.stop();
  }
}

function _path(fileName) {
  if (!fileName.includes('.')) fileName += defaultFileExt;
  return `${soundDir}/${fileName}`;
}

function _jitter(magnitude) {
  return (Math.random() - 0.5) * magnitude;
}

window.expose('Sound', Sound);