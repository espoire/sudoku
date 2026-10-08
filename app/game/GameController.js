import GlobalVueProps from '../VueInterface.js';
import Settings from '../Settings.js';
import Constants from '../Constants.js';
import UserSettingsManager from '../UserSettingsManager.js';
import Board from './Board.js';
import BoardInteractor from './BoardInteractor.js';
import { defaultPuzzleConfig } from './puzzles.js';

const { modes } = Constants;

export default class GameController {
  static #modeBeforeSettings = null;

  /** @type {modes} */
  mode = modes.title;

  /** @type {Board} */
  board = null;
  /** @type {BoardInteractor} */
  boardInteractor = null;

  begin() {
    UserSettingsManager.syncVue();
    this.showTitleScreen();
  }

  showTitleScreen() {
    GameController.setMode(modes.title);
  }

  onAdvanceFromTitleScreen() {
    this.board = new Board(defaultPuzzleConfig);
    this.boardInteractor = new BoardInteractor(this.board);
    this.boardInteractor.updateVue();
    GameController.setMode(modes.play);
  }

  static onSettingsClicked() {
    GameController.#modeBeforeSettings = GlobalVueProps.mode;
    GameController.setMode(modes.settings);
  }

  static onReturnFromSettings() {
    GameController.setMode(GameController.#modeBeforeSettings);
  }

  static setMode(mode) {
    if (Settings.test?.log?.uiModeChanges) console.log(`Setting mode to ${mode}`);
    GlobalVueProps.mode = mode;
  }
}