import { array, fillFrom } from "../util/Array.js";

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

  /**
   * Initializes a new Sudoku board with the given size and initial numerals.
   * @param {*} param0 The parameter object.
   * @param {string} param0.title The title of the puzzle.
   * @param {{ x: number, y: number }} param0.size
   * @param {string[]} param0.given A list of strings each representing a board row. Numerals are used for given values, and spaces represent non-given (empty) cells.
   */
  constructor({ size = { x: 9, y: 9 }, given }) {
    this.size = structuredClone(size);

    this.cells = array(size.y, size.x);
    fillFrom(this.cells, (y, x) => new Cell(x, y));

    this.#loadGivenNumerals(given);
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
        if (digits.includes(value)) this.cells[y][x].lock(value);
      }
    }
  }

  /**
   * Sets the value of a cell on the board, if it is not locked.
   * @param {number} row The row index of the cell.
   * @param {number} column The column index of the cell.
   * @param {number|null} value The value to set, or null to clear the cell.
   */
  setValue(row, column, value) {
    const cell = this.cells[row][column];
    if (cell.locked) return;
    cell.value = value;
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

  lock(value) {
    this.value = value;
    this.locked = true;
  }

  toVue() {
    return { value: this.value, given: this.locked };
  }
}