/** @typedef {import('../Board.js').default} Board */
/** @typedef {import('./Constraint.js').ConstraintCheckResult} ConstraintCheckResult */

export default class SudokuRowDigitUniquenessConstraint {
  static id = 'sudokuRow';

  /**
   * @param {Board} board
   * @returns {ConstraintCheckResult} A detailed result for checking the whole board.
   */
  static check(board) {
    const errors = [];

    for (let y = 0; y < board.size.y; y++) {
      const locationsWithValue = [];

      for (let x = 0; x < board.size.x; x++) {
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
            message: `Duplicate value ${value} in row ${y}`
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
  static checkNote(board, note) {
    const target = note.value;
    
    const y = note.row;
    for (let x = 0; x < board.size.x; x++) {
      if (x === note.column) continue;
      if (board.getValue(y, x) === target) return false;
    }

    return true;
  }
}