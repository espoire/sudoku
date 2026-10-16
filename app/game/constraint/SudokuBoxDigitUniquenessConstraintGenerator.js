/** @typedef {import('../Board.js').default} Board */
/** @typedef {import('./Constraint.js').ConstraintCheckResult} ConstraintCheckResult */

export default class SudokuBoxDigitUniquenessConstraintGenerator {
  /**
   * @param {{ x: number, y: number }} boardSize The size of the sudoku board for which to generate the box digit uniqueness constraint.
   */
  static generate(boardSize) {
    const { boxes, boxWidth, boxHeight } = this.selectBoxesFor(boardSize);

    const check = (board) => {
      const errors = [];
  
      // Iterate the boxes, checking for duplicate values within each box.
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const locationsWithValue = [];
  
        for (const { row, column } of box.cells) {
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
    };

    const checkNote = (board, note) => {
      const target = note.value;

      const x = note.column;
      const y = note.row;

      // Select the box containing the query cell.
      const boxOriginX = Math.floor(x / boxWidth) * boxWidth;
      const boxOriginY = Math.floor(y / boxHeight) * boxHeight;
      const box = boxes.find(b => b.origin.x === boxOriginX && b.origin.y === boxOriginY);

      // Iterate over the cells in the relevant box, checking the constraint
      for (const { row, column } of box.cells) {
        if (row === y && column === x) continue;
        if (board.getValue(row, column) === target) {
          return false;
        }
      }

      return true;
    };

    return {
      check,
      checkNote,
    };
  }

  static selectBoxesFor(boardSize) {
    // Generate the 3x3 boxes for the Sudoku board
    const boxes = [];

    let boxWidth, boxHeight;
    if (boardSize.x === 9 && boardSize.y === 9) {
      boxWidth = 3;
      boxHeight = 3;
    } else if (boardSize.x === 6 && boardSize.y === 6) {
      boxWidth = 3;
      boxHeight = 2;
    } else if (boardSize.x === 4 && boardSize.y === 4) {
      boxWidth = 2;
      boxHeight = 2;
    } else {
      throw new Error(`Unsupported board size for SudokuBoxDigitUniquenessConstraint: ${boardSize.x}x${boardSize.y}`);
    }

    const boxRowLength = boardSize.x / boxWidth;
    const boxColumnLength = boardSize.y / boxHeight;

    for (let boxY = 0; boxY < boxColumnLength; boxY++) {
      for (let boxX = 0; boxX < boxRowLength; boxX++) {
        const cells = [];
        const origin = { x: boxX * boxWidth, y: boxY * boxHeight };
        for (let offsetY = 0; offsetY < boxHeight; offsetY++) {
          for (let offsetX = 0; offsetX < boxWidth; offsetX++) {
            const x = origin.x + offsetX;
            const y = origin.y + offsetY;
            cells.push({ row: y, column: x });
          }
        }

        boxes.push({ origin, cells, width: boxWidth, height: boxHeight });
      }
    }

    return {
      boxes,
      boxWidth,
      boxHeight,
    };
  }
}