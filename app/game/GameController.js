import ThreeVueInterface from '../VueInterface.js';
import Settings from '../Settings.js';
import Constants from '../Constants.js';
import UserSettingsManager from '../UserSettingsManager.js';

const { modes } = Constants;

export default class GameController {
  /** @type {modes} */
  mode = modes.title;

  begin() {
    UserSettingsManager.syncVue();
    this.showTitleScreen();
  }

  showTitleScreen() {
    GameController.setMode(modes.title);
  }

  onAdvanceFromTitleScreen() {
    
  }

  static onSettingsClicked() {
    GameController.setMode(modes.settings);
  }

  static setMode(mode) {
    if (Settings.test?.log?.uiModeChanges) console.log(`Setting mode to ${mode}`);
    ThreeVueInterface.props.mode = mode;
  }
}