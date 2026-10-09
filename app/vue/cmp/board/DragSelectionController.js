import Globals from '/app/Globals.js';

export default class DragSelectionController {
  /** @type {import('vue').Ref<HTMLElement>} */ #boardRef;
  /** @type {boolean} */ dragging = false;
  /** @type {Set<string>|null} */ visitedCells = null;

  constructor(boardRef) {
    this.#boardRef = boardRef;
  }
  

  start(event) {
    this.dragging = true;
    this.visitedCells = new Set();

    this.#boardRef.value.setPointerCapture(event.pointerId);
  }

  getCellTarget(event) {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const cell = element?.closest('.board-cell');
    if (!cell) return;

    const cellId = cell.dataset.cell;
    const [row, column] = cellId.split(',').map(Number);

    return { row, column };
  }

  /**
   * @param event {MouseEvent}
   * @returns {boolean} True if the cell was marked as visited, false if it was already visited.
   */
  markCellDragVisited(event) {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const cell = element?.closest('.board-cell');
    if (!cell) return;

    const cellId = cell.dataset.cell;
    if (this.visitedCells.has(cellId)) return false;
    this.visitedCells.add(cellId);
    return true;
  }

  applyCellDragSelectionIfNotAlreadyVisited(event) {
    if (!this.markCellDragVisited(event)) return;

    const {row, column} = this.getCellTarget(event);
    Globals.gameController.boardInteractor.handleCellDragEnter(row, column);
  }

  drag(event) {
    if (!this.dragging) return;
    this.applyCellDragSelectionIfNotAlreadyVisited(event);
  }

  end(event) {
    this.dragging = false;
    this.visitedCells = null;
    this.#boardRef.value.releasePointerCapture(event.pointerId);
  }
}