/** @typedef {import('./Board.js').default} Board */

/**
 * Constraint model and checker class for Sudoku and variant rules.
 */
export default class Constraint {
  /** @type {(board: Board, cell?: { row: number, column: number, value: number }) => boolean | object} */ #checkFn;

  constructor(checkFn) {
    this.#checkFn = checkFn;
  }

  /**
   * Checks whether the given board satisfies this constraint.
   * @param {Board} board
   * @param {{ row: number, column: number, value: number } | null} cell The specific cell to check, if applicable.
   * @returns {boolean | { valid: boolean, errors: { location: { row: number, column: number }[], message: string }[] }} True(pass)/false(violation) if checking a single cell, or a detailed result if checking the whole board.
   */
  check(board, cell = null) {
    return this.#checkFn(board, cell);
  }

  static #merge(...constraints) {
    return new Constraint((board, cell = null) => {
      if (cell != null) {
        // Check the specific cell against all constraints

        return constraints.every(constraint => {
          const result = constraint.check(board, cell);
          return typeof result === 'boolean' ? result : result.valid;
        });

      } else {
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

    });
  }

  static sudokuRow = new Constraint((board, cell = null) => {
    if (cell != null) {
      // Check if a specified value @ a particular cell violates this constraint.

      const y = cell.row;
      const target = cell.value;
      for (let x = 0; x < board.size.x; x++) {
        if (x === cell.column) continue;
        if (board.getValue(y, x) === target) {
          return false;
        }
      }

      return true;
    } else {
      // Check whole board and return summary
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
  });

  static sudokuColumn = new Constraint((board, cell = null) => {
    if (cell != null) {
      // Check if a specified value @ a particular cell violates this constraint.

      const x = cell.column;
      const target = cell.value;
      for (let y = 0; y < board.size.y; y++) {
        if (y === cell.row) continue;
        if (board.getValue(y, x) === target) {
          return false;
        }
      }

      return true;

    } else {
      // Check whole board and return summary
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
  });

  static sudokuBox = new Constraint((board, cell = null) => {
    if (cell != null) {
      // Check if a specified value @ a particular cell violates this constraint.
      const x = cell.column;
      const y = cell.row;
      const target = cell.value;
      const boxStartX = Math.floor(x / 3) * 3;
      const boxStartY = Math.floor(y / 3) * 3;
      for (let offsetY = 0; offsetY < 3; offsetY++) {
        for (let offsetX = 0; offsetX < 3; offsetX++) {
          const checkX = boxStartX + offsetX;
          const checkY = boxStartY + offsetY;
          if (checkX === x && checkY === y) continue;
          if (board.getValue(checkY, checkX) === target) {
            return false;
          }
        }
      }

      return true;

    } else {
      // Check whole board for duplicate values within each 3x3 box and return a summary of errors.
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
    }
  });

  static basic9x9SudokuRules = Constraint.#merge(
    Constraint.sudokuRow,
    Constraint.sudokuColumn,
    Constraint.sudokuBox
  );
}