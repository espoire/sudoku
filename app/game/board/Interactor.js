/** @typedef {import('./board/Board.js').default} Board */
import { randomArrayElement } from '../../util/random.js';
import GlobalVueProps from '../../VueInterface.js';
import { create2DArray } from './helpers.js';

const directionVector = {
  up: { row: -1, column: 0 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
  right: { row: 0, column: 1 },
};

export default class Interactor {
  /** @type {Board} */ board;
  /** @type {{ row: number, column: number }?} */ activeCell = null;
  /** @type {Array<Array<boolean>>} */ selectedCells = [];
  /** @type {{ win: boolean, valid?: boolean, errors?: Array<{ message: string, location: Array<{ row: number, column: number }>}> }} */ cachedValidationResult = null;
  
  constructor(board) {
    this.board = board;
    this.selectedCells = create2DArray(board.size.y, board.size.x, false);
  }

  resetPuzzle() {
    this.board.reset();
    this.clearSelection();
    this.cachedValidationResult = null;
    this.updateVue();
  }

  /**
   * Handles user input for clicking on a cell.
   * @param {number} row The row index of the cell.
   * @param {number} column The column index of the cell.
   */
  handleCellActivation(row, column) {
    // If the target cell is the ONLY selected cell, deselect it instead of selecting it again.
    const selection = this.listSelection();
    if (selection.length === 1 && selection[0].row === row && selection[0].column === column) {
      this.selectedCells[row][column] = false;
      this.activeCell = null;
      this.updateVue();
      return;
    }

    // Else, replace the current selection with the newly activated cell.
    this.clearSelection();
    this.selectedCells[row][column] = !this.selectedCells[row][column];
    this.activeCell = { row, column };
    this.updateVue();
  }
  
  handleCellDragEnter(row, column) {
    this.selectedCells[row][column] = true;
    this.activeCell = { row, column };
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
  listSelection() {
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

  /**
   * Moves the current selection in the specified direction, or starts a new selection if none exists.
   * @param {'up' | 'left' | 'down' | 'right'} direction The direction to move the selection.
   */
  moveSelection(direction) {
    
    // Start a new selection if no selected cell exists.
    if (!this.hasAnySelection() && !this.activeCell) {
      const centerRowIndex = Math.floor(this.board.size.y / 2);
      const centerColumnIndex = Math.floor(this.board.size.x / 2);
      this.selectedCells[centerRowIndex][centerColumnIndex] = true;
      this.activeCell = { row: centerRowIndex, column: centerColumnIndex };
    }

    // Move the selection in the specified direction.
    
    // Choose a single selected cell (randomly for now),
    const { row, column } = this.activeCell ?? randomArrayElement(this.listSelection());
    
    // then deselect all,
    this.clearSelection();
    
    // and select its neighbor in the indicated direction,
    // wrapping around edges.
    const newRow = (row + directionVector[direction].row + this.board.size.y) % this.board.size.y;
    const newColumn = (column + directionVector[direction].column + this.board.size.x) % this.board.size.x;
    this.selectedCells[newRow][newColumn] = true;
    this.activeCell = { row: newRow, column: newColumn };

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
        error: this.cachedValidationResult?.errors?.some(e => e.location.some(l => l.row === rowIndex && l.column === columnIndex)) ?? false,
      }))
    );
    vm.active = this.activeCell ? { ...this.activeCell } : null;
  }
}