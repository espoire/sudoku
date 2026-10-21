import GlobalVueProps from '../VueInterface.js';
import Settings from '../Settings.js';
import puzzleConfigs, { getAllPuzzlesWithDifficulty } from './puzzles.js';
import Constants from '../Constants.js';
import UserSettingsManager from '../UserSettingsManager.js';
import Board from './board/Board.js';
import BoardInteractor from './board/BoardInteractor.js';
import PuzzleEditInteractor from './board/PuzzleEditInteractor.js';
import Timer from './Timer.js';
import { anyPuzzlesExistWithDifficulty, selectRandomPuzzleId } from './puzzles.js';
import RandomTitles from '../vue/cmp/edit/RandomTitles.js';
import PuzzleConfigPermutor from './generator/PuzzleConfigPermutor.js';

const { modes } = Constants;

export default class GameController {
  static #modeBeforeSettings = null;

  /** @type {modes} */
  mode = modes.menu;

  /** @type {Board} */ board = null;
  /** @type {BoardInteractor | PuzzleEditInteractor} */ interactor = null;
  /** @type {Timer} */ timer = new Timer();

  begin() {
    UserSettingsManager.syncVue();
    GameController.showMainMenu();
  }

  static showMainMenu() {
    GameController.setMode(modes.menu);
  }

  static showPuzzleDirectory() {
    const puzzles = getAllPuzzlesWithDifficulty(null);
    GlobalVueProps.puzzles = puzzles.map(cfg => ({ id: cfg.id, title: cfg.title }));
    GameController.setMode(modes.directory);
  }

  showPuzzleEditor() {
    RandomTitles.pickNew();
    this.board = new Board(puzzleConfigs.find(cfg => cfg.id === null));
    this.interactor = new PuzzleEditInteractor(this.board);
    this.interactor.updateVue();
    GameController.setMode(modes.edit);
  }

  showDifficultySelect() {
    const vm = GlobalVueProps.directory.hasDifficulty;

    for (let i = 1; i <= 5; i++) {
      vm[i] = anyPuzzlesExistWithDifficulty(i);
    }

    GameController.setMode(modes.difficultySelect);
  }

  startPuzzle(difficulty = null) {
    const id = selectRandomPuzzleId(difficulty);
    this.startPuzzleById(id);
  }

  startPuzzleById(id, { permute = true } = {}) {
    let puzzleConfig = puzzleConfigs.find(cfg => cfg.id === id);
    if (permute) puzzleConfig = PuzzleConfigPermutor.permute(puzzleConfig);

    this.board = new Board(puzzleConfig);
    this.interactor = new BoardInteractor(this.board);
    this.interactor.updateVue();
    this.timer.restart();
    GlobalVueProps.puzzleId = id;
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