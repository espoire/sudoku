/** @typedef {import('./Board.js').default} Board */
import Constants from "../Constants.js";
import GlobalVueProps from "../VueInterface.js";

/**
 * A UI model and controller for interacting with the Sudoku board.
 * Wraps and mediates access to a Board data object.
 * Supports its own cell-multi-selection and notations management.
 */
export default class BoardInteractor {
  /** @type {Board} */ board;
  /** @type {Array<Array<Set<number>>>} */ cornerNotes = [];
  /** @type {Array<Array<boolean>>} */ selectedCells = [];
  /** @type {{ win: boolean, valid?: boolean, errors?: Array<{ message: string, location: Array<{ row: number, column: number }>}> }} */ #cachedValidationResult = null;
  /** @type {'digit' | 'cornerNote' | 'centerNote' | 'cellColor'} */ #inputMode = Constants.inputModes.digit;

  constructor(board) {
    this.board = board;

    this.selectedCells = create2DArray(board.size.y, board.size.x, false);
    this.cornerNotes = create2DArray(board.size.y, board.size.x, () => new Set());
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

  /** @param {'digit' | 'cornerNote' | 'centerNote' | 'cellColor'} mode */
  setInputMode(mode) {
    this.#inputMode = mode;
    
    const vm = GlobalVueProps;
    vm.inputMode = this.#inputMode;
  }

  /**
   * Applies a user's numeral input to all selected cells (except Given cells).
   * @param {number?} value The number the user pressed, or null for a command to clear the selected cells.
   */
  handleNumeralInput(value) {
    const selection = this.#listSelection();

    // TODO explicit-delete is a special case, ignoring mode and targetting whatever data is present, in a priority order

    switch (this.#inputMode) {
      case Constants.inputModes.digit: {
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
        // If input is a digit and ALL note-able selected cells already contain that corner-note digit, instead delete the value from all selected cells.
        const isDigit = (value != null);
        const noteable = selection.filter(({ row, column }) => this.board.canEdit(row, column) && this.board.getValue(row, column) == null);
        const allNoteableCellsContainSameNote = noteable.every(({ row, column }) => this.cornerNotes[row][column].has(value));

        let mode = 'adding';
        if (isDigit && allNoteableCellsContainSameNote) {
          mode = 'removing';
        }

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
      case Constants.inputModes.centerNote:
        // Handle center note input mode
      break;
      case Constants.inputModes.cellColor:
        // Handle cell color input mode
      break;
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
          },
        } : {},
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