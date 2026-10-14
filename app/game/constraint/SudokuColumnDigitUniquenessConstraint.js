/** @typedef {import('../Board.js').default} Board */
/** @typedef {import('./Constraint.js').ConstraintCheckResult} ConstraintCheckResult */

export default class SudokuColumnDigitUniquenessConstraint {
  static type = 'correctness';

  /**
   * @param {Board} board
   * @returns {ConstraintCheckResult} A detailed result for checking the whole board.
   */
  static checkFn(board) {
    const errors = [];
  
    for (let x = 0; x < board.size.x; x++) {
      const locationsWithValue = [];

      for (let y = 0; y < board.size.y; y++) {
        const value = board.getValue(y, x);
        if (value !== null) {
          locationsWithValue[value] ??= [];
          const list = locationsWithValue[value];
          list.push({ row: y, column: x });
        }
      }

      for (const value in locationsWithValue) {
        const list = locationsWithValue[value];
        if (list.length > 1) {
          errors.push({
            location: list,
            message: `Duplicate value ${value} in column ${x}`
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Checks whether inserting the given value at the specified cell would violate this constraint.
   * @param {Board} board 
   * @param {{ row: number, column: number, value: number }} note 
   * @returns {boolean}
   */
  static checkNoteFn(board, note) {
    const target = note.value;

    const x = note.column;
    for (let y = 0; y < board.size.y; y++) {
      if (y === note.row) continue;
      if (board.getValue(y, x) === target) return false;
    }

    return true;
  }
}