import Constants from './Constants.js';
import { deepClone } from './util/object.js';
import { deepFreeze, environmentIsDev, educatedGuessIfEnvironmentIsMobile } from './util/Util.js';

/** Test settings, and user-configurable settings. */
const Settings = {
  test: {
    // Meta
    // disableTestMode: true,

    suppressPuzzlePermute: true,

    log: {
      uiEventHandling: false,
      modalEventRouting: false,
      uiModeChanges: false, // Logs whenever GameController.setMode is called (e.g. swapping fullscreen UIs like: combat/roleplay/map)
    },
  },

  user: {
    isMobile: educatedGuessIfEnvironmentIsMobile(),
    darkMode: false,
    digitStyle: false,
    userHighlightPalette: Constants.palettes.regular,
    timer: true,
    timerTenths: false,
    checkBadNotes: true,
    deleteBadNotes: false,
    highlightRowColumn: true,
    accentuateSameNumber: true,
    // mouseoverInput: false,
  },
};

export const defaultUserSettings = deepClone(Settings.user);
deepFreeze(defaultUserSettings);

if (environmentIsDev() && !Settings.test.disableTestMode) {
  console.log('Test mode is enabled.');
} else {
  Settings.test = {};
}

deepFreeze(Settings.test);
export default Settings;

window.Settings = Settings;