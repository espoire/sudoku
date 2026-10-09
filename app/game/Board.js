import { array, fillFrom } from "../util/Array.js";
import Constraint from "./Constraint.js";

/** Data & logic class for the Sudoku board.
 * Supports variable sizes, including standard 9x9 and smaller variants.
 * Provides methods for manipulating and querying the board state.
 * 
 * Constraints (e.g. standard Sudoku rules, box position/shape, variant rules, etc.) to be implemented separately.
 * User-notation to be tracked in a future class: the board-interactor state/controller. The board interactor will wrap this board state class, and use its public methods to alter/query the board state.
 */
export default class Board {
  /** @type {{ x: number, y: number }} */ size;
  /** @type {Cell[][]} */ cells;
  /** @type {Constraint[]} */ constraints = [];

  /**
   * Initializes a new Sudoku board with the given size and initial numerals.
   * @param {*} param0 The parameter object.
   * @param {string} param0.title The title of the puzzle.
   * @param {{ x: number, y: number }} param0.size
   * @param {string[]} param0.given A list of strings each representing a board row. Numerals are used for given values, and spaces represent non-given (empty) cells.
   */
  constructor({ size = { x: 9, y: 9 }, given, constraints = [Constraint.basic9x9SudokuRules] }) {
    this.size = structuredClone(size);

    this.cells = array(size.y, size.x);
    fillFrom(this.cells, (y, x) => new Cell(x, y));

    this.#loadGivenNumerals(given);
    this.constraints = constraints;
  }

  /**
   * @param {string[]} given
   */
  #loadGivenNumerals(given) {
    if (!given) return;

    const digits = ['1','2','3','4','5','6','7','8','9'];
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        const value = given?.[y]?.[x];
        if (digits.includes(value)) this.cells[y][x].lock(+value);
      }
    }
  }

  getValue(row, column) {
    return this.cells[row][column].value;
  }

  /**
   * Sets the value of a cell on the board, if it is not locked.
   * @param {number} row The row index of the cell.
   * @param {number} column The column index of the cell.
   * @param {number|null} value The value to set, or null to clear the cell.
   * @returns {boolean} True if the value was set successfully, false if the cell is locked.
   */
  setValue(row, column, value) {
    const cell = this.cells[row][column];
    if (cell.locked) return false;
    cell.value = value;

    return true;
  }

  reset() {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (!this.cells[y][x].locked) this.cells[y][x].value = null;
      }
    }
  }

  /**
   * @returns {{ win: boolean, valid?: boolean, errors?: Array<{ message: string, location: Array<{ row: number, column: number }>}> }}
   */
  checkWin() {
    let constraintResult;

    // First, check constraints
    for (const constraint of this.constraints) {
      constraintResult = constraint.check(this);
      if (!constraintResult.valid) {
        for (const error of constraintResult.errors) {
          console.error(error.message, ...error.location);
        }
        return { win: false, ...constraintResult };
      }
    }
    
    // Also, check if all cells are filled
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (this.cells[y][x].value === null) return { win: false, ...constraintResult };
      }
    }

    return { win: true };
  }
}

/**
 * Tracks state of a single cell on the Sudoku board.
 */
class Cell {
  /** @type {{ x: number, y: number }} */ position;
  /** @type {number|null} */ value = null;
  /** @type {boolean} Non-editable by the user, used for pre-provided values at start of new puzzle. */ locked = false;
  // TODO notation state

  constructor(x, y) {
    this.position = { x, y };
  }

  /**
   * @param {number} value
   */
  lock(value) {
    this.value = value;
    this.locked = true;
  }

  toVue() {
    return { value: this.value, given: this.locked };
  }
}