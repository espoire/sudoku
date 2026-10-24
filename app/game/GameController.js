import GlobalVueProps from '../VueInterface.js';
import Settings from '../Settings.js';
import puzzleConfigs, { getAllPuzzlesWithDifficulty } from './puzzles.js';
import Constants from '../Constants.js';
import UserSettingsManager from '../UserSettingsManager.js';
import Board from './board/Board.js';
import PuzzlePlayInteractor from './board/PuzzlePlayInteractor.js';
import PuzzleEditInteractor from './board/PuzzleEditInteractor.js';
import Timer from './Timer.js';
import { anyPuzzlesExistWithDifficulty, selectRandomPuzzleId } from './puzzles.js';
import RandomTitles from '../vue/cmp/edit/RandomTitles.js';
import PuzzleConfigPermutor from './generator/PuzzleConfigPermutor.js';
import SaveDataManager from '../save/SaveDataManager.js';
import { errorOrThrow } from '../util/Util.js';

const { modes } = Constants;

export default class GameController {
  static #modeBeforeSettings = null;

  /** @type {modes} */
  mode = modes.menu;

  /** @type {Board} */ board = null;
  /** @type {PuzzlePlayInteractor | PuzzleEditInteractor} */ interactor = null;
  /** @type {Timer} */ timer = new Timer();

  begin() {
    UserSettingsManager.syncVue();
    GameController.showMainMenu();
  }

  static showMainMenu() {
    const vm = GlobalVueProps;
    vm.enableContinue = SaveDataManager.hasSavedGame();
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

    for (const difficultyNumeral of Object.values(Constants.difficulty)) {
      vm[difficultyNumeral] = anyPuzzlesExistWithDifficulty(difficultyNumeral);
    }

    GameController.setMode(modes.difficultySelect);
  }

  loadSavedPlayPuzzle() {
    const savedGameInteractor = SaveDataManager.loadGameState();
    if (!savedGameInteractor) {
      errorOrThrow('Save game load failed.');
      GlobalVueProps.enableContinue = false;
      return;
    }

    this.resumePuzzle(savedGameInteractor);
  }

  startPuzzle(difficulty = null) {
    const id = selectRandomPuzzleId(difficulty);
    this.startPuzzleById(id);
  }

  startPuzzleById(id) {
    let puzzleConfig = puzzleConfigs.find(cfg => cfg.id === id);
    if (!Settings.test?.suppressPuzzlePermute) puzzleConfig = PuzzleConfigPermutor.permute(puzzleConfig);

    this.board = new Board(puzzleConfig);
    this.interactor = new PuzzlePlayInteractor(this.board);
    this.interactor.updateVue();
    this.timer.restart();
    GlobalVueProps.puzzleId = id;
    GameController.setMode(modes.play);
  }

  resumePuzzle(savedGameInteractor) {
    this.board = savedGameInteractor.board;
    this.interactor = savedGameInteractor;
    this.interactor.updateVue();
    this.timer.restart(); // TODO save/load this too
    GlobalVueProps.puzzleId = this.board.id;
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

  handleNumeralInput(value) {
    if (this.interactor) this.interactor.handleNumeralInput(value);
    if (this.interactor.wasWin) this.timer.stop();
    if (GlobalVueProps.mode === modes.play) SaveDataManager.saveGameState(this.interactor);
    if (GlobalVueProps.mode === modes.edit) SaveDataManager.saveEditState(this.interactor);
  }
}