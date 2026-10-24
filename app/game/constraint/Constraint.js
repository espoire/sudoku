/** @typedef {import('../Board.js').default} Board */
/** @typedef {{ valid: boolean, errors: { location: { row: number, column: number }[], message: string }[] }} ConstraintCheckResult */

import SudokuRowDigitUniquenessConstraint from './SudokuRowDigitUniquenessConstraint.js';
import SudokuColumnDigitUniquenessConstraint from './SudokuColumnDigitUniquenessConstraint.js';
import SudokuBoxDigitUniquenessConstraintGenerator from './SudokuBoxDigitUniquenessConstraintGenerator.js';
import AllCellsFilledCompletionConstraint from './AllCellsFilledCompletionConstraint.js';

/**
 * Constraint model and checker class for Sudoku and variant rules.
 */
export default class Constraint {
  static sudokuRow = new Constraint(SudokuRowDigitUniquenessConstraint);
  static sudokuColumn = new Constraint(SudokuColumnDigitUniquenessConstraint);
  static sudokuBox = (board) => new Constraint(SudokuBoxDigitUniquenessConstraintGenerator.generate(board.size));
  static allCellsFilled = new Constraint(AllCellsFilledCompletionConstraint);

  /** @type {string} */ #id;
  /** @type {(board: Board) => ConstraintCheckResult} */ #checkFn;
  /** @type {(board: Board, note: { row: number, column: number, value: number }) => boolean} */ #checkNoteFn;
  /** @type {(board: Board) => boolean} */ #checkCompleteFn;

  /**
   * @param {(board: Board) => ConstraintCheckResult} check The function to check the constraint.
   * @param {(board: Board, note: { row: number, column: number, value: number }) => boolean} checkNote The function to check the constraint for a specific cell.
   * @param {(board: Board) => boolean} checkComplete The function to check the completion condition of the constraint.
   */
  constructor({ id, check, checkNote, checkComplete }) {
    this.#id = id;
    this.#checkFn = check;
    this.#checkNoteFn = checkNote;
    this.#checkCompleteFn = checkComplete;
  }

  /**
   * Checks whether the given board satisfies this constraint.
   * @param {Board} board
   * @returns {ConstraintCheckResult?} A detailed result for checking the whole board, or null if this constraint does not provide a full-board-in-progress validity check.
   */
  check(board) {
    if (typeof this.#checkFn === 'function') return  this.#checkFn(board);
    return null;
  }

  /**
   * Checks whether inserting the given value at the specified cell would violate this constraint.
   * @param {Board} board 
   * @param {{ row: number, column: number, value: number }} note 
   * @returns {boolean} False if inserting the value would violate this constraint, true otherwise.
   */
  checkNote(board, note) {
    if (typeof this.#checkNoteFn === 'function') return this.#checkNoteFn(board, note);
    return true;
  }

  /**
   * Checks whether the given board satisfies the completion condition of this constraint.
   * @param {Board} board
   * @returns {boolean}
   */
  checkComplete(board) {
    if (typeof this.#checkCompleteFn === 'function') return this.#checkCompleteFn(board);
    return true;
  }

  /**
   * @param  {...ConstraintCheckResult} results
   * @returns {ConstraintCheckResult} Merged result of all provided constraint check results.
   */
  static mergeConstraintCheckResults(...results) {
    let valid = true;
    const errors = [];

    for (const result of results) {
      if (!result.valid) {
        valid = false;
        errors.push(...result.errors);
      }
    }

    return { valid, errors };
  }

  toSaveDataObject() {
    return this.#id;
  }
}