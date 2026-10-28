/** @typedef {import('./board/Board.js').default} Board */
import Constants from "../../Constants.js";
import SaveDataManager from "../../save/SaveDataManager.js";
import { trim2dArray } from "../../save/util.js";
import Settings from "../../Settings.js";
import UserSettingsManager from "../../UserSettingsManager.js";
import { sort } from "../../util/sort.js";
import GlobalVueProps from "../../VueInterface.js";
import Timer from "../Timer.js";
import Board from "./Board.js";
import { CellColorSet } from "./CellColor.js";
import { create2DArray } from "./helpers.js";
import Interactor from "./Interactor.js";

/**
 * A UI model and controller for interacting with the Sudoku board.
 * Wraps and mediates access to a Board data object.
 * Supports its own cell-multi-selection and notations management.
 */
export default class PuzzlePlayInteractor extends Interactor {
  /** @type {Timer} */ timer = new Timer();
  /** @type {Array<Array<Set<number>>>} */ cornerNotes = [];
  /** @type {Array<Array<Set<number>>>} */ centerNotes = [];
  /** @type {Array<Array<CellColorSet>>} */ cellColors = []; 
  /** @type {'digit' | 'corner-note' | 'center-note' | 'cell-color'} */ #inputMode = Constants.inputModes.digit;
  /** @type {'regular' | 'color-blind'} */ #palette = Settings.user.userHighlightPalette;
  /** @type {boolean} */ wasWin = false;

  constructor(board) {
    super(board);
    this.cornerNotes = create2DArray(board.size.y, board.size.x, () => new Set());
    this.centerNotes = create2DArray(board.size.y, board.size.x, () => new Set());
    this.cellColors = create2DArray(board.size.y, board.size.x, () => new CellColorSet());
  }

  resetPuzzle() {
    super.resetPuzzle();
    this.timer.reset();
    this.cornerNotes = create2DArray(this.board.size.y, this.board.size.x, () => new Set());
    this.centerNotes = create2DArray(this.board.size.y, this.board.size.x, () => new Set());
    this.cellColors = create2DArray(this.board.size.y, this.board.size.x, () => new CellColorSet());
    this.wasWin = false;
    this.updateVue();
  }

  /** @param {'digit' | 'corner-note' | 'center-note' | 'cell-color'} mode */
  setInputMode(mode) {
    this.#inputMode = mode;
    
    const vm = GlobalVueProps;
    vm.inputMode = this.#inputMode;
  }

  /**
   * Cycles the input mode to the next or previous mode.
   * @param {'next' | 'previous'} direction
   */
  cycleInputMode(direction = 'next') {
    const inputModes = Object.values(Constants.inputModes);

    const currentIndex = inputModes.indexOf(this.#inputMode);

    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % inputModes.length;
      this.setInputMode(inputModes[nextIndex]);
    } else if (direction === 'previous') {
      const prevIndex = (currentIndex - 1 + inputModes.length) % inputModes.length;
      this.setInputMode(inputModes[prevIndex]);
    }
  }

  togglePalette() {
    if (this.#inputMode !== Constants.inputModes.cellColor) return;
    this.#palette = (this.#palette === 'regular' ? 'color-blind' : 'regular');

    // Update the Vue
    const vm = GlobalVueProps;
    vm.palette = this.#palette;

    // Save to user settings
    UserSettingsManager.setSetting('userHighlightPalette', this.#palette);
    SaveDataManager.saveUserSettings();
  }

  /**
   * Applies a user's numeral input to all selected cells (except Given cells).
   * @param {number?} value The number the user pressed, or null for a command to clear the selected cells.
   */
  handleNumeralInput(value) {
    if (this.wasWin) return;

    const selection = this.listSelection();

    let wasEntryChange = false;

    if (value == null) {
      const modeApplied = this.#handleDelete();
      if (modeApplied === 'entries') wasEntryChange = true;

    } else switch (this.#inputMode) {
      case Constants.inputModes.digit: {
        wasEntryChange = true;
        if (value === 0) value = null;

        // If input is a digit and ALL editable selected cells already contain that digit, instead delete the value from all selected cells.
        const isDigit = (value != null);
        const editable = selection.filter(({ row, column }) => this.board.canEdit(row, column));
        const allEditableContainSameValue = editable.every(({ row, column }) => this.board.getValue(row, column) === value);
        if (isDigit && allEditableContainSameValue) {
          value = null;
        }

        // Apply the changes, note if any cells were successfully updated.
        let wroteAny = false;
        for (const { row, column } of editable) {
          const changed = this.board.setValue(row, column, value);
          wroteAny ||= changed;
        }
      } break;
      case Constants.inputModes.cornerNote: {
        if (value === 0) value = null;

        // If input is a digit and ALL note-able selected cells already contain that corner-note digit, instead delete the value from all selected cells.
        const isDigit = (value != null);
        const noteable = selection.filter(({ row, column }) => this.board.canEdit(row, column) && this.board.getValue(row, column) == null);
        const allNoteableCellsContainSameNote = noteable.every(({ row, column }) => this.cornerNotes[row][column].has(value));

        let mode = 'adding';
        if (isDigit && allNoteableCellsContainSameNote) {
          mode = 'removing';
        }

        // Apply change
        for (const { row, column } of noteable) {
          if (value == null) {
            this.cornerNotes[row][column].clear();
          } else if (mode === 'adding') {
            this.cornerNotes[row][column].add(value);
          } else if (mode === 'removing') {
            this.cornerNotes[row][column].delete(value);
          }
        }

        this.#validateNotes();

      } break;
      case Constants.inputModes.centerNote: {
        if (value === 0) value = null;

        // If input is a digit and ALL note-able selected cells already contain that center-note digit, instead delete the value from all selected cells.
        const isDigit = (value != null);
        const noteable = selection.filter(({ row, column }) => this.board.canEdit(row, column) && this.board.getValue(row, column) == null);
        const allNoteableCellsContainSameNote = noteable.every(({ row, column }) => this.centerNotes[row][column].has(value));

        let mode = 'adding';
        if (isDigit && allNoteableCellsContainSameNote) {
          mode = 'removing';
        }

        // Apply change
        for (const { row, column } of noteable) {
          if (value == null) {
            this.centerNotes[row][column].clear();
          } else if (mode === 'adding') {
            this.centerNotes[row][column].add(value);
          } else if (mode === 'removing') {
            this.centerNotes[row][column].delete(value);
          }
        }

        this.#validateNotes();

      } break;
      case Constants.inputModes.cellColor: {
        if (value == null) break;

        let colorId;
        if (value === 0) {
          colorId = 'theme';
        } else {
          colorId = (this.#palette === 'regular' ? 'c' : 'b') + value;
        }

        const allSelectedCellsContainSameColor = selection.every(({ row, column }) => this.cellColors[row][column].has(colorId));

        let mode = 'adding';
        if (allSelectedCellsContainSameColor) {
          mode = 'removing';
        }

        // Apply change
        for (const { row, column } of selection) {
          if (mode === 'adding') {
            this.cellColors[row][column].add(colorId);
          } else if (mode === 'removing') {
            this.cellColors[row][column].delete(colorId);
          }
        }
      } break;
    }

    if (wasEntryChange) {
      const validationResult = this.board.checkWin();
      this.cachedValidationResult = validationResult;
      if (validationResult.win) {
        if (!this.wasWin) {
          this.timer.stop();
          setTimeout(() => alert("Win! 🎉"), 0); // To give Vue time to rerender with the new correct digit(s) before declaring victory
        }
        this.wasWin = true;
      } else {
        this.#validateNotes();
      }
      if (Settings.user.deleteBadNotes) this.deleteAllNotesWithErrors();
    }

    // Update the UI with the new board state & validations.
    this.updateVue();
  }

  /**
   * Handles an explicit delete input, discarding entries, notes, or colors from the selected cells based on priority.
   * 
   * Priority order:
   * - Usually: entries → notes → colors
   * - If the current input mode is cellColor / "Highlight": colors → entries → notes
   * 
   * Only the first applicable deletion mode in the priority order will be applied.
   * 
   * @returns {'entries' | 'notes' | 'colors' | null} The deletion mode that was applied, or null if no deletion occurred.
   */
  #handleDelete() {
    // Explicit delete: clear selected cells using a priority order

    const priority = this.#inputMode === Constants.inputModes.cellColor ? ['colors', 'entries', 'notes'] : ['entries', 'notes', 'colors'];
    const operationMap = {
      entries: this.#attemptDeleteEntries.bind(this),
      notes: this.#attemptDeleteNotes.bind(this),
      colors: this.#attemptDeleteColors.bind(this),
    };

    while (priority.length > 0) {
      const deletionMode = priority.shift();
      const operationFn = operationMap[deletionMode];
      if (!operationFn) continue;

      const changeWasApplied = operationFn();
      if (changeWasApplied) {
        console.log(`Deletion applied: ${deletionMode}`);
        return deletionMode;
      }
    }

    return null;
  }

  #attemptDeleteEntries() {
    // If any editable selected cells contain a value, clear values
    const selection = this.listSelection();
    const editable = selection.filter(({ row, column }) => this.board.canEdit(row, column));
    const anyEditableContainValue = editable.some(({ row, column }) => this.board.getValue(row, column) != null);
    if (!anyEditableContainValue) return false;

    for (const { row, column } of editable) {
      this.board.setValue(row, column, null);
    }
    return true;
  }

  #attemptDeleteNotes() {
    // If any noteable selected cells contain a center-note and/or corner-note, clear those notes

    // (Since noteable := no value, and we must have no values to have reached this `else` case, noteable === editable)
    const selection = this.listSelection();
    const noteable = selection.filter(({ row, column }) => this.board.canEdit(row, column) && this.board.getValue(row, column) == null);
    const anyNoteableContainNotes = noteable.some(({ row, column }) => {
      const hasCornerNotes = this.cornerNotes[row][column].size > 0;
      const hasCenterNotes = this.centerNotes[row][column].size > 0;
      return hasCornerNotes || hasCenterNotes;
    });
    if (!anyNoteableContainNotes) return false;

    for (const { row, column } of noteable) {
      this.cornerNotes[row][column].clear();
      this.centerNotes[row][column].clear();
    }
    return true;
  }

  #attemptDeleteColors() {
    // If any background-color related user colors are present, clear those
    const selection = this.listSelection();
    const anySelectedContainColors = selection.some(({ row, column }) => this.cellColors[row][column].size > 0);
    if (!anySelectedContainColors) return false;

    for (const { row, column } of selection) {
      this.cellColors[row][column].clear();
    }
    return true;
  }

  deleteAllNotesWithErrors() {
    if (!this.cachedNotesValidationResult) return;

    for (let row = 0; row < this.board.size.y; row++) {
      for (let column = 0; column < this.board.size.x; column++) {
        const cellValidation = this.cachedNotesValidationResult[row]?.[column];
        if (!cellValidation) continue;

        for (const note in cellValidation) {
          if (!cellValidation[note]) {
            this.cornerNotes[row][column].delete(+note);
            this.centerNotes[row][column].delete(+note);
          }
        }
      }
    }
  }

  #validateNotes() {
    if (!Settings.user.checkBadNotes) {
      this.cachedNotesValidationResult = null;
      return;
    }

    const notesSummary = this.#prepareNotesSummary();
    this.cachedNotesValidationResult = this.board.validateNotes(notesSummary);
  }

  /**
   * Lists all active (in cells without full-fledged digits) notes on the board, in a concise mode (center versus corner)-independent manner.
   * @returns {Array<Array<Set<number>>>} A 2D array representing the summary of active notes for each cell.
   */
  #prepareNotesSummary() {
    return create2DArray(this.board.size.y, this.board.size.x, (row, column) => {
      if (this.board.getValue(row, column) != null) return null;
      if (this.cornerNotes[row][column].size + this.centerNotes[row][column].size === 0) return null;
      return new Set([...this.cornerNotes[row][column], ...this.centerNotes[row][column]]);
    });
  }

  /**
   * Updates the Vue.js reactive board model with the current state of the board and selection.
   */
  updateVue() {
    const vm = GlobalVueProps.board;
    vm.size.x = this.board.size.x;
    vm.size.y = this.board.size.y;
    vm.contents = this.board.cells.map((row, rowIndex) =>
      row.map((cell, columnIndex) => ({
        ...cell.toVue(),
        selected: this.selectedCells[rowIndex][columnIndex],
        error: this.cachedValidationResult?.errors?.some(e => e.location.some(l => l.row === rowIndex && l.column === columnIndex)) ?? false,
        ...(this.board.getValue(rowIndex, columnIndex) == null) ? {
          notes: {
            corner: Array.from(this.cornerNotes[rowIndex][columnIndex]).sort(sort.numeric.ascending).map(n => ({ value: n, valid: this.cachedNotesValidationResult?.[rowIndex]?.[columnIndex]?.[n] })),
            center: Array.from(this.centerNotes[rowIndex][columnIndex]).sort(sort.numeric.ascending).map(n => ({ value: n, valid: this.cachedNotesValidationResult?.[rowIndex]?.[columnIndex]?.[n] })),
          },
        } : {},
        colors: this.cellColors[rowIndex][columnIndex].colors,
      }))
    );
    vm.active = this.activeCell ? { ...this.activeCell } : null;
    vm.accentuate = this.getAccentuatedNumber();
    
    GlobalVueProps.inputMode = this.#inputMode;
  }

  toSaveDataObject() {
    return {
      ...super.toSaveDataObject(),
      cornerNotes: trim2dArray(this.cornerNotes.map(row => row.map(cell => cell.size ? [...cell] : null))),
      centerNotes: trim2dArray(this.centerNotes.map(row => row.map(cell => cell.size ? [...cell] : null))),
      cellColors: trim2dArray(this.cellColors.map(row => row.map(cell => cell.toSaveDataObject()))),
      timer: Math.floor(this.timer.getElapsedTime()  / 100), // tenths
    };
  }

  /**
   * Rehydrates a gameplay state from a saved data object.
   * 
   * @param {Object} data The saved data object to rehydrate from.
   * @returns {PuzzlePlayInteractor} The rehydrated PuzzlePlayInteractor instance.
   */
  static rehydrate(data) {
    const board = Board.rehydrate(data);
    const interactor = new PuzzlePlayInteractor(board);
    interactor.timer.setInitialTime(data.timer * 100); // convert back to milliseconds
    interactor.cornerNotes = create2DArray(board.size.y, board.size.x, (row, col) => new Set(data.cornerNotes?.[row]?.[col]));
    interactor.centerNotes = create2DArray(board.size.y, board.size.x, (row, col) => new Set(data.centerNotes?.[row]?.[col]));
    interactor.cellColors = create2DArray(board.size.y, board.size.x, (row, col) => CellColorSet.rehydrate(data.cellColors?.[row]?.[col]));
    return interactor;
  }
}