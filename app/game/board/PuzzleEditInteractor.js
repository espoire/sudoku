import Interactor from "./Interactor.js";

/**
 * A UI model and controller for editing a Sudoku puzzle.
 * Wraps and mediates access to a Board data object.
 */
export default class PuzzleEditInteractor extends Interactor {
  resetPuzzle() {
    super.resetPuzzle();
    this.updateVue();
  }

  /**
   * Applies a user's numeral input to all selected cells (except Given cells).
   * @param {number?} value The number the user pressed, or null for a command to clear the selected cells.
   */
  handleNumeralInput(value) {
    const selection = this.listSelection();

    if (value === 0) value = null;

    const isDigit = (value != null);
    const allEditableContainSameValue = selection.every(({ row, column }) => this.board.getValue(row, column) === value);
    if (isDigit && allEditableContainSameValue) value = null;

    // Apply the changes, note if any cells were successfully updated.
    let wroteAny = false;
    for (const { row, column } of selection) {
      const changed = this.board.writeGiven(row, column, value);
      wroteAny ||= changed;
    }

    // If any successful changes, re-validate
    if (wroteAny) this.cachedValidationResult = this.board.checkWin();

    // Update the UI with the new board state & validations.
    this.updateVue();
  }
}