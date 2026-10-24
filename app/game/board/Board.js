/** @typedef {import("../constraint/Constraint.js").default} Constraint */

import { trim2dArray } from "../../save/util.js";
import { array, fillFrom } from "../../util/Array.js";
import Constraint from "../constraint/Constraint.js";
import ConstraintLoader from "../constraint/ConstraintLoader.js";
import puzzleConfigs from "../puzzles.js";

/** Data & logic class for the Sudoku board.
 * Supports variable sizes, including standard 9x9 and smaller variants.
 * Provides methods for manipulating and querying the board state.
 * 
 * Constraints (e.g. standard Sudoku rules, box position/shape, variant rules, etc.) to be implemented separately.
 * User-notation to be tracked in a future class: the board-interactor state/controller. The board interactor will wrap this board state class, and use its public methods to alter/query the board state.
 */
export default class Board {
  /** @type {string?} */ id = null;
  /** @type {{ x: number, y: number }} */ size;
  /** @type {Cell[][]} */ cells;
  /** @type {Constraint[]} */ constraints = [];

  /**
   * Initializes a new Sudoku board with the given size and initial numerals.
   * @param {*} config The parameter object.
   * @param {string} config.id The unique identifier of the puzzle, if any.
   * @param {{ x: number, y: number }} config.size
   * @param {string[]} config.given A list of strings each representing a board row. Numerals are used for given values, and spaces represent non-given (empty) cells.
   * @param {string[]} config.constraints An array of constraint descriptors to apply to the board. May reference other data elements on the config. 
   */
  constructor(config) {
    let { id, size, given } = config;
    if (size == null) size = { x: 9, y: 9 };
    if (given == null) given = config.givens ?? Array(size.y).fill(' '.repeat(size.x));

    if (id) this.id = id;

    this.size = structuredClone(size);

    this.cells = array(size.y, size.x);
    fillFrom(this.cells, (y, x) => new Cell(x, y));

    this.#loadGivenNumerals(given);
    this.constraints = ConstraintLoader.load(config);
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

  /**
   * Returns the currently-entered cell values as a simple 2D int array.
   */
  toRaw() {
    return this.cells.map(row => row.map(cell => cell.value));
  }

  getValue(row, column) {
    return this.cells[row][column].value;
  }

  /**
   * Sets the value of a cell on the board, if it is not locked.
   * @param {number} row The row index of the cell.
   * @param {number} column The column index of the cell.
   * @param {number|null} value The value to set, or null to clear the cell.
   * @returns {boolean} True if the value was set successfully, false if the cell is locked or already contains the given value.
   */
  setValue(row, column, value) {
    const cell = this.cells[row][column];
    if (cell.locked) return false;
    if (cell.value === value) return false;

    cell.value = value;
    return true;
  }

  /**
   * Sets the value of a cell as a given, bypassing the locked check.
   * If deleting an existing given value, the cell will be unlocked.
   * 
   * @param {number} row The row index of the cell.
   * @param {number} column The column index of the cell.
   * @param {number|null} value The value to set, or null to clear the cell.
   * @returns {boolean} True if the value was changed, false otherwise.
   */
  writeGiven(row, column, value) {
    const cell = this.cells[row][column];
    if (cell.value === value) return false;

    cell.value = value;
    cell.locked = (value != null);
    return true;
  }

  canEdit(row, column) {
    return !this.cells[row][column].locked;
  }

  reset() {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (!this.cells[y][x].locked) this.cells[y][x].value = null;
      }
    }
  }

  /**
   * Checks whether the current board state satisfies all constraints and if all cells are filled.
   * @param {boolean} [enumerate=true] Whether to enumerate all constraint violations or stop at the first failure.
   * @returns {{ win: boolean, valid?: boolean, errors?: Array<{ message: string, location: Array<{ row: number, column: number }>}> }}
   */
  checkWin(enumerate = true) {
    let results = { valid: true, errors: [] };

    // Check for correctness first
    for (const constraint of this.constraints) {
      const constraintResult = constraint.check(this);
      if (constraintResult == null) continue;

      if (!constraintResult.valid) {
        for (const error of constraintResult.errors) console.warn(error.message, ...error.location);
        if (!enumerate) return { win: false, ...constraintResult };
      }

      results = Constraint.mergeConstraintCheckResults(results, constraintResult);
    }

    // Then check for completion
    let complete = true;
    for (const constraint of this.constraints) {
      complete &&= constraint.checkComplete(this);
    }

    return { win: complete && results.valid, ...results };
  }

  /**
   * @param {Array<Array<Set<number> | null>>} notesSummary A 2D array representing the summary of active notes for each cell.
   * @returns {Array<Array<Dictionary<number, boolean> | null>>} A 2D array representing the validation result for each cell's notes.
   */
  validateNotes(notesSummary) {
    return notesSummary.map((row, rowIndex) =>
      row.map((notes, columnIndex) => {
        if (notes == null) return null;
        const validation = {};
        for (const note of notes) {
          validation[note] = this.constraints.every(constraint => {
            const result = constraint.checkNote(this, { row: rowIndex, column: columnIndex, value: note });
            return result;
          });
        }
        return validation;
      })
    );
  }

  /**
   * @returns {Array<Array<number|null>>} A 2D array representing the current entries on the board -- that is, user-entered values.
   */
  getEntriesMap() {
    return trim2dArray(this.cells.map(row => row.map(cell => (!cell.locked ? cell.value : null))));
  }

  getGivensMap() {
    return trim2dArray(this.cells.map(row => row.map(cell => (cell.locked ? cell.value : null))));
  }

  toSaveDataObject() {
    const ret = {};

    if (this.id) {
      ret.id = this.id;
    } else {
      ret.size = structuredClone(this.size);
      ret.givens = this.getGivensMap();
      ret.constraints = this.constraints.map(constraint => constraint.toSaveDataObject());
    }
    ret.entries = this.getEntriesMap();

    return ret;
  }

  static rehydrate(data) {
    let { id, size, constraints, givens, entries } = data;

    let board;
    if (id) {
      const config = puzzleConfigs.find(config => config.id === id);
      if (config) {
        board = new Board(config);
      }
    }

    if (!board) {
      board = new Board({ size, constraints });

      // Givens don't match the internal puzzle setup format, so we need to manually apply them.
      for (let row = 0; row < givens?.length; row++) {
        for (let col = 0; col < givens?.[row]?.length; col++) {
          const value = givens?.[row]?.[col];
          if (value != null) {
            board.cells[row][col].lock(value);
          }
        }
      }
    }

    // Apply user-entered entries to the board.
    for (let row = 0; row < entries?.length; row++) {
      for (let col = 0; col < entries?.[row]?.length; col++) {
        const value = entries?.[row]?.[col];
        if (value != null) {
          board.cells[row][col].value = value;
        }
      }
    }

    return board;
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