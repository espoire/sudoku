/** @typedef {import('./Board.js').default} Board */
import GlobalVueProps from "../VueInterface.js";

/**
 * A UI model and controller for interacting with the Sudoku board.
 * Wraps and mediates access to a Board data object.
 * Supports its own cell-multi-selection and notations management.
 */
export default class BoardInteractor {
  /** @type {Board} */ board;
  /** @type {Array<Array<boolean>>} */ selectedCells = [];

  constructor(board) {
    this.board = board;

    this.selectedCells = Array.from({ length: board.size.y }, () =>
      Array.from({ length: board.size.x }, () => false)
    );
  }

  /**
   * Handles user input for clicking on a cell.
   * @param {number} row The row index of the cell.
   * @param {number} column The column index of the cell.
   */
  handleCellActivation(row, column) {
    this.selectedCells[row][column] = !this.selectedCells[row][column];
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
    for (let row = 0; row < this.selectedCells.length; row++) {
      for (let column = 0; column < this.selectedCells[row].length; column++) {
        this.selectedCells[row][column] = false;
      }
    }
    this.updateVue();
  }

  /**
   * Applies a user's numeral input to all selected cells (except Given cells).
   * @param {number?} value The number the user pressed, or null for a command to clear the selected cells.
   */
  handleNumeralInput(value) {
    const selection = this.#listSelection();
    let wroteAny = false;

    for (const { row, column } of selection) {
      const success = this.board.setValue(row, column, value);
      wroteAny ||= success;
    }

    if (wroteAny) {
      const won = this.board.checkWin();
      if (won) setTimeout(() => alert("Win! 🎉"), 0);
    }

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
      }))
    );
  }
}