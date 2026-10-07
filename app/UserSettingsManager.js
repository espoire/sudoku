import Globals from './Globals.js';
import Settings, { defaultUserSettings } from './Settings.js';
import ThreeVueInterface from './VueInterface.js';
import { deepSet, dereference } from './util/object.js';
import { warnInDev } from './util/Util.js';

const userSettings = Settings.user;

const specialOptionsTypes = {
  isMobile: 'boolean',
  sound: {
    effects: 'boolean',
  },
};

export default class UserSettingsManager {
  static toggleSetting(setting) {
    const current = dereference(userSettings, setting);

    const options = UserSettingsManager.#getOptionsFor(setting);
    if (options == null) throw new Error(`Cannot toggle; no options found for setting: ${setting}`);

    let newValue;
    const currentIndex = options.indexOf(current);
    if (currentIndex === -1) {
      warnInDev(
        `Current value of setting ${setting} (${current}) is not in its options: ${options}`
      );
      newValue = options[0];
    } else {
      newValue = options[(currentIndex + 1) % options.length];
    }

    UserSettingsManager.setSetting(setting, newValue);
  }

  static #getOptionsFor(setting) {
    const type = dereference(specialOptionsTypes, setting);

    if (Array.isArray(type)) return type;
    if (type === 'boolean') return [false, true];
    return null;
  }

  static setSetting(setting, value) {
    deepSet(userSettings, setting, value, /* createMissing */ true);
    UserSettingsManager.#updateVue(setting);
    Globals.saveFile?.save({ force: true }); // Bypass dev-test save prevention; if we manually change a setting, we want it saved.
  }

  /**
   * Recursively load settings from a configuration object.
   * @param {Record<string, *>} config
   */
  static loadFrom(config, route = '') {
    for (const setting in config) {
      const value = config[setting];

      if (typeof value === 'object') {
        UserSettingsManager.loadFrom(value, route + setting + '.');
      } else {
        UserSettingsManager.setSetting(route + setting, value);
      }
    }
  }

  static #updateVue(setting) {
    const current = dereference(userSettings, setting);

    // Must set only primitive values directly, to avoid Vue reactivity issues.
    if (typeof current === 'object') {
      return UserSettingsManager.syncVue(current, setting + '.');
    }

    deepSet(ThreeVueInterface.props.userSettings, setting, current, /* createMissing */ true);
  }

  static syncVue(value = userSettings, prefix = '') {
    for (const setting in value) {
      UserSettingsManager.#updateVue(prefix + setting);
    }
  }

  static compress(settingsObject, ret = {}, route = '') {
    for (const setting in settingsObject) {
      const value = settingsObject[setting];

      if (typeof value === 'object') {
        UserSettingsManager.compress(value, ret, route + setting + '.');
      } else {
        const defaultSetting = dereference(defaultUserSettings, route + setting);
        if (value === defaultSetting) continue;
        deepSet(ret, route + setting, value, /* createMissing */ true);
      }
    }

    return ret;
  }
}

window.UserSettingsManager = { syncVue: UserSettingsManager.syncVue };
