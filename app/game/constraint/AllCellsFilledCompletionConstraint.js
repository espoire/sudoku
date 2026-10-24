/** @typedef {import('../Board.js').default} Board */

export default class AllCellsFilledCompletionConstraint {
  static id = 'allCellsFilled';

  static checkComplete(board) {
    for (let y = 0; y < board.size.y; y++) {
      for (let x = 0; x < board.size.x; x++) {
        if (board.cells[y][x].value === null) return false;
      }
    }

    return true;
  }
}