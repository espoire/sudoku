import GlobalVueProps from '../VueInterface.js';
import Settings from '../Settings.js';
import puzzleConfigs from './puzzles.js';
import Constants from '../Constants.js';
import UserSettingsManager from '../UserSettingsManager.js';
import Board from './Board.js';
import BoardInteractor from './BoardInteractor.js';
import Timer from './Timer.js';

const { modes } = Constants;

export default class GameController {
  static #modeBeforeSettings = null;

  /** @type {modes} */
  mode = modes.title;

  /** @type {Board} */ board = null;
  /** @type {BoardInteractor} */ boardInteractor = null;
  /** @type {Timer} */ timer = new Timer();

  begin() {
    UserSettingsManager.syncVue();
    GameController.showTitleScreen();
  }

  static onAdvanceFromTitleScreen() {
    // Globals.gameController.onStartPuzzle(puzzleConfigs[5].id);
    GameController.showPuzzleDirectory();
    // GameController.showPuzzleEditor();
  }

  static showTitleScreen() {
    GameController.setMode(modes.title);
  }

  static showPuzzleDirectory() {
    GlobalVueProps.puzzles = puzzleConfigs.map(cfg => ({ id: cfg.id, title: cfg.title }));
    GameController.setMode(modes.directory);
  }

  static showPuzzleEditor() {
    GameController.setMode(modes.edit);
  }

  onStartPuzzle(id) {
    this.board = new Board(puzzleConfigs.find(cfg => cfg.id === id));
    this.boardInteractor = new BoardInteractor(this.board);
    this.boardInteractor.updateVue();
    this.timer.start();
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