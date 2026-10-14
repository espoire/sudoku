/** @typedef {import('../Board.js').default} Board */
/** @typedef {{ valid: boolean, errors: { location: { row: number, column: number }[], message: string }[] }} ConstraintCheckResult */

import SudokuBoxDigitUniquenessConstraintGenerator from './SudokuBoxDigitUniquenessConstraintGenerator.js';
import SudokuColumnDigitUniquenessConstraint from './SudokuColumnDigitUniquenessConstraint.js';
import SudokuRowDigitUniquenessConstraint from './SudokuRowDigitUniquenessConstraint.js';

/**
 * Constraint model and checker class for Sudoku and variant rules.
 */
export default class Constraint {
  /** @type {(board: Board) => ConstraintCheckResult} */ #checkFn;
  /** @type {(board: Board, note: { row: number, column: number, value: number }) => boolean} */ #checkNoteFn;
  /** @type {'correctness' | 'completion' | 'composite'} */ #type;
  get type() { return this.#type; }

  /**
   * @param {(board: Board) => ConstraintCheckResult} checkFn The function to check the constraint.
   * @param {(board: Board, note: { row: number, column: number, value: number }) => boolean} checkNoteFn The function to check the constraint for a specific cell.
   * @param {'correctness' | 'completion' | 'composite'} type The type of the constraint. Correctness constraints are used for rule-violation highlighting, while completion constraints only block the completion of the puzzle. Composite constraints combine multiple constraints into one.
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

  static #merge(...constraints) {
    const checkFn = (board) => {
      // Check the whole board against all constraints & merge summaries

      let valid = true;
      let errors = [];

      for (const constraint of constraints) {
        const result = constraint.check(board);
        if (!result.valid) {
          valid = false;
          errors = errors.concat(result.errors);
        }
      }

      return { valid, errors };
    }

    const checkNoteFn = (board, note = null) => {
      // Check the specific cell against all constraints

      return constraints.every(constraint => {
        const result = constraint.checkNote(board, note);
        return typeof result === 'boolean' ? result : result.valid;
      });
    };

    return new Constraint({ checkFn, checkNoteFn, type: 'composite' });
  }

  static sudokuRow = new Constraint(SudokuRowDigitUniquenessConstraint);
  static sudokuColumn = new Constraint(SudokuColumnDigitUniquenessConstraint);
  static sudokuBox = (board) => new Constraint(SudokuBoxDigitUniquenessConstraintGenerator.generate(board.size));

  static basic9x9SudokuRules = Constraint.#merge(
    Constraint.sudokuRow,
    Constraint.sudokuColumn,
    Constraint.sudokuBox({ size: { x: 9, y: 9 } }),
  );
}