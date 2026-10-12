/** @typedef {import('./Board.js').default} Board */
import Constants from "../Constants.js";
import GlobalVueProps from "../VueInterface.js";
import { CellColorSet } from "./CellColor.js";

/**
 * A UI model and controller for interacting with the Sudoku board.
 * Wraps and mediates access to a Board data object.
 * Supports its own cell-multi-selection and notations management.
 */
export default class BoardInteractor {
  /** @type {Board} */ board;
  /** @type {Array<Array<boolean>>} */ selectedCells = [];
  /** @type {Array<Array<Set<number>>>} */ cornerNotes = [];
  /** @type {Array<Array<Set<number>>>} */ centerNotes = [];
  /** @type {Array<Array<CellColorSet>>} */ cellColors = []; 
  /** @type {{ win: boolean, valid?: boolean, errors?: Array<{ message: string, location: Array<{ row: number, column: number }>}> }} */ #cachedValidationResult = null;
  /** @type {'digit' | 'corner-note' | 'center-note' | 'cell-color'} */ #inputMode = Constants.inputModes.digit;
  /** @type {'regular' | 'color-blind'} */ #palette = Constants.palettes.regular;

  constructor(board) {
    this.board = board;

    this.selectedCells = create2DArray(board.size.y, board.size.x, false);
    this.cornerNotes = create2DArray(board.size.y, board.size.x, () => new Set());
    this.centerNotes = create2DArray(board.size.y, board.size.x, () => new Set());
    this.cellColors = create2DArray(board.size.y, board.size.x, () => new CellColorSet());
  }

  resetPuzzle() {
    this.board.reset();
    this.clearSelection();
    this.#cachedValidationResult = null;
    this.updateVue();
  }

  /**
   * Handles user input for clicking on a cell.
   * @param {number} row The row index of the cell.
   * @param {number} column The column index of the cell.
   */
  handleCellActivation(row, column) {
    // If the target cell is the ONLY selected cell, deselect it instead of selecting it again.
    const selection = this.#listSelection();
    if (selection.length === 1 && selection[0].row === row && selection[0].column === column) {
      this.selectedCells[row][column] = false;
      this.updateVue();
      return;
    }

    // Else, replace the current selection with the newly activated cell.
    this.clearSelection();
    this.selectedCells[row][column] = !this.selectedCells[row][column];
    this.updateVue();
  }

  handleCellDragEnter(row, column) {
    this.selectedCells[row][column] = true;
    this.updateVue();
  }

  selectAllMatchingValues(row, column) {
    this.clearSelection();

    const value = this.board.cells[row][column].value;
    if (value == null) return;

    for (let r = 0; r < this.board.size.y; r++) {
      for (let c = 0; c < this.board.size.x; c++) {
        if (this.board.cells[r][c].value === value) {
          this.selectedCells[r][c] = true;
        }
      }
    }

    this.updateVue();
  }

  /**
   * @returns {Array<{row: number, column: number}>} The list of selected cells.
   */
  #listSelection() {
    const selection = [];

    for (let row = 0; row < this.selectedCells.length; row++) {
      for (let column = 0; column < this.selectedCells[row].length; column++) {
        if (this.selectedCells[row][column]) {
          selection.push({ row, column });
        }
      }
    }

    return selection;
  }

  /**
   * @returns {boolean} True if at least one cell is currently selected.
   */
  hasAnySelection() {
    for (let row = 0; row < this.selectedCells.length; row++) {
      for (let column = 0; column < this.selectedCells[row].length; column++) {
        if (this.selectedCells[row][column]) return true;
      }
    }

    return false;
  }

  /**
   * Clears the current selection of cells.
   */
  clearSelection() {
    this.#setAllCellsSelection(false);
  }

  selectAllCells() {
    this.#setAllCellsSelection(true);
  }

  #setAllCellsSelection(state) {
    for (let row = 0; row < this.selectedCells.length; row++) {
      for (let column = 0; column < this.selectedCells[row].length; column++) {
        this.selectedCells[row][column] = state;
      }
    }

    this.updateVue();
  }

  /** @param {'digit' | 'corner-note' | 'center-note' | 'cell-color'} mode */
  setInputMode(mode) {
    this.#inputMode = mode;
    
    const vm = GlobalVueProps;
    vm.inputMode = this.#inputMode;
  }

  togglePalette() {
    if (this.#inputMode !== Constants.inputModes.cellColor) return;
    this.#palette = (this.#palette === 'regular' ? 'color-blind' : 'regular');
    const vm = GlobalVueProps;
    vm.palette = this.#palette;
  }

  /**
   * Applies a user's numeral input to all selected cells (except Given cells).
   * @param {number?} value The number the user pressed, or null for a command to clear the selected cells.
   */
  handleNumeralInput(value) {
    const selection = this.#listSelection();

    if (value == null) {
      // Explicit delete: clear selected cells regardless of input mode, using a priority order

      // If any editable selected cells contain a value, clear values
      const editable = selection.filter(({ row, column }) => this.board.canEdit(row, column));
      const anyEditableContainValue = editable.some(({ row, column }) => this.board.getValue(row, column) != null);
      if (anyEditableContainValue) {
        for (const { row, column } of editable) {
          this.board.setValue(row, column, null);
        }
      } else {

        // Else if any noteable selected cells contain a center-note and/or corner-note, clear those notes

        // (Since noteable := no value, and we must have no values to have reached this `else` case, noteable === editable)
        const anyEditableContainNotes = editable.some(({ row, column }) => {
          const hasCornerNotes = this.cornerNotes[row][column].size > 0;
          const hasCenterNotes = this.centerNotes[row][column].size > 0;
          return hasCornerNotes || hasCenterNotes;
        });
        if (anyEditableContainNotes) {
          for (const { row, column } of editable) {
            this.cornerNotes[row][column].clear();
            this.centerNotes[row][column].clear();
          }
        } else {

          // Else if any background-color related user colors are present, clear those
          for (const { row, column } of selection) {
            this.cellColors[row][column].clear();
          }
        }
      }
    } else switch (this.#inputMode) {
      case Constants.inputModes.digit: {
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

        // If any successful changes, re-validate
        let validationResult = null;
        if (wroteAny) {
          validationResult = this.board.checkWin();
          if (validationResult.win) setTimeout(() => alert("Win! 🎉"), 0);

          this.#cachedValidationResult = validationResult;
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

        // TODO note constraint validation

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
      } break;
      case Constants.inputModes.cellColor: {
        if (value == null) break; // Ignore null values for cell color input, for now   // TODO
        // Will need to distinguish explicit zero (keyboard/numpad/soft button) from null (delete/backspace/space)
        // Explicit zero: treat as color id: 'theme' input.
        // Null: use the delete info priority queue described in /todo.txt.   // TODO

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

    // Update the UI with the new board state & validations.
    this.updateVue();
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
        error: this.#cachedValidationResult?.errors?.some(e => e.location.some(l => l.row === rowIndex && l.column === columnIndex)) ?? false,
        ...(this.board.getValue(rowIndex, columnIndex) == null) ? {
          notes: {
            corner: Array.from(this.cornerNotes[rowIndex][columnIndex]),
            center: Array.from(this.centerNotes[rowIndex][columnIndex]),
          },
        } : {},
        colors: this.cellColors[rowIndex][columnIndex].colors,
      }))
    );
  }
}

function create2DArray(rows, columns, generatorFnOrValue) {
  let generatorFn = generatorFnOrValue;
  if (typeof generatorFnOrValue !== 'function') generatorFn = () => generatorFnOrValue;

  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, generatorFn)
  );
}