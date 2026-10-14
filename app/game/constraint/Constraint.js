/** @typedef {import('../Board.js').default} Board */
/** @typedef {{ valid: boolean, errors: { location: { row: number, column: number }[], message: string }[] }} ConstraintCheckResult */

import SudokuRowDigitUniquenessConstraint from './SudokuRowDigitUniquenessConstraint.js';
import SudokuColumnDigitUniquenessConstraint from './SudokuColumnDigitUniquenessConstraint.js';
import SudokuBoxDigitUniquenessConstraintGenerator from './SudokuBoxDigitUniquenessConstraintGenerator.js';

/**
 * Constraint model and checker class for Sudoku and variant rules.
 */
export default class Constraint {
  static sudokuRow = new Constraint(SudokuRowDigitUniquenessConstraint);
  static sudokuColumn = new Constraint(SudokuColumnDigitUniquenessConstraint);
  static sudokuBox = (board) => new Constraint(SudokuBoxDigitUniquenessConstraintGenerator.generate(board.size));

  /** @type {(board: Board) => ConstraintCheckResult} */ #checkFn;
  /** @type {(board: Board, note: { row: number, column: number, value: number }) => boolean} */ #checkNoteFn;
  /** @type {'correctness' | 'completion'} */ #type;
  get type() { return this.#type; }

  /**
   * @param {(board: Board) => ConstraintCheckResult} checkFn The function to check the constraint.
   * @param {(board: Board, note: { row: number, column: number, value: number }) => boolean} checkNoteFn The function to check the constraint for a specific cell.
   * @param {'correctness' | 'completion'} type The type of the constraint. Correctness constraints are used for rule-violation highlighting, while completion constraints only block the completion of the puzzle.
   */
  constructor({ checkFn, checkNoteFn, type = 'correctness' }) {
    this.#checkFn = checkFn;
    this.#checkNoteFn = checkNoteFn;
    this.#type = type;
  }

  /**
   * Checks whether the given board satisfies this constraint.
   * @param {Board} board
   * @returns {ConstraintCheckResult} A detailed result for checking the whole board.
   */
  check(board) {
    return this.#checkFn(board);
  }

  /**
   * Checks whether inserting the given value at the specified cell would violate this constraint.
   * @param {Board} board 
   * @param {{ row: number, column: number, value: number }} note 
   * @returns {boolean}
   */
  checkNote(board, note) {
    return this.#checkNoteFn(board, note);
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
}