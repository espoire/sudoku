import GlobalVueProps from '../VueInterface.js';
import Settings from '../Settings.js';
import puzzleConfigs from './puzzles.js';
import Constants from '../Constants.js';
import UserSettingsManager from '../UserSettingsManager.js';
import Board from './board/Board.js';
import BoardInteractor from './board/BoardInteractor.js';
import PuzzleEditInteractor from './board/PuzzleEditInteractor.js';
import Timer from './Timer.js';
import Globals from '../Globals.js';

const { modes } = Constants;

export default class GameController {
  static #modeBeforeSettings = null;

  /** @type {modes} */
  mode = modes.title;

  /** @type {Board} */ board = null;
  /** @type {BoardInteractor | PuzzleEditInteractor} */ interactor = null;
  /** @type {Timer} */ timer = new Timer();

  begin() {
    UserSettingsManager.syncVue();
    GameController.showTitleScreen();
  }

  onAdvanceFromTitleScreen() {
    Globals.gameController.onStartPuzzle(puzzleConfigs[5].id);
    // GameController.showPuzzleDirectory();
    // this.showPuzzleEditor();
  }

  static showTitleScreen() {
    GameController.setMode(modes.title);
  }

  static showPuzzleDirectory() {
    GlobalVueProps.puzzles = puzzleConfigs.map(cfg => ({ id: cfg.id, title: cfg.title }));
    GameController.setMode(modes.directory);
  }

  showPuzzleEditor() {
    this.board = new Board(puzzleConfigs.find(cfg => cfg.id === null));
    this.interactor = new PuzzleEditInteractor(this.board);
    this.interactor.updateVue();
    GameController.setMode(modes.edit);
  }

  onStartPuzzle(id) {
    this.board = new Board(puzzleConfigs.find(cfg => cfg.id === id));
    this.interactor = new BoardInteractor(this.board);
    this.interactor.updateVue();
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