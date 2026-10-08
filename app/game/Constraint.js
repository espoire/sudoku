/** @typedef {import('./Board.js').default} Board */

/**
 * Constraint model and checker class for Sudoku and variant rules.
 */
export default class Constraint {
  /** @type {(board: Board) => *} */ #checkFn;

  constructor(checkFn) {
    this.#checkFn = checkFn;
  }

  /**
   * Checks whether the given board satisfies this constraint.
   * @param {Board} board
   * @returns {{ valid: boolean, errors: { location: { row: number, column: number }[], message: string }[] }} True if the board satisfies the constraint, false otherwise.
   */
  check(board) {
    return this.#checkFn(board);
  }

  static #merge(...constraints) {
    return new Constraint((board) => {
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
    });
  }

  static sudokuRow = new Constraint((board) => {
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
  });

  static sudokuColumn = new Constraint((board) => {
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
  });

  static sudokuBox = new Constraint((board) => {
    const errors = [];

    // Generate the 3x3 boxes for the Sudoku board
    const boxes = [];
    for (let boxY = 0; boxY < 3; boxY++) {
      for (let boxX = 0; boxX < 3; boxX++) {
        const cells = [];
        const origin = { x: boxX * 3, y: boxY * 3 };
        for (let offsetY = 0; offsetY < 3; offsetY++) {
          for (let offsetX = 0; offsetX < 3; offsetX++) {
            const x = origin.x + offsetX;
            const y = origin.y + offsetY;
            cells.push({ row: y, column: x });
          }
        }

        boxes.push(cells);
      }
    }

    // Iterate the boxes, checking for duplicate values within each box.
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const locationsWithValue = [];

      for (const { row, column } of box) {
        const value = board.getValue(row, column);
        if (value !== null) {
          locationsWithValue[value] ??= [];
          const list = locationsWithValue[value];
          list.push({ row, column });
        }
      }

      for (const value in locationsWithValue) {
        const list = locationsWithValue[value];
        if (list.length > 1) {
          errors.push({
            location: list,
            message: `Duplicate value ${value} in box ${i}`
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  });

  static basic9x9SudokuRules = Constraint.#merge(
    Constraint.sudokuRow,
    Constraint.sudokuColumn,
    Constraint.sudokuBox
  );
}