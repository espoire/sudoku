/** @typedef {import('../board/CellColor.js').CellColorSet} CellColorSet */

import { ensureArray } from '../../util/Array.js';
import { setEquals } from '../../util/set.js';
import { sort } from '../../util/sort.js';
import { warnOrThrow } from '../../util/Util.js';
import { CellColorSet } from '../board/CellColor.js';

/**
 * @typedef {{ 
 *   entries?: (number | null)[][],
 *   cornerNotes?: Set<number>[][],
 *   centerNotes?: Set<number>[][],
 *   cellColors?: CellColorSet[][],
 *   timer?: number | null,
 * }} UndoableStateSnapshot
 */

/**
 * @typedef {{
 *   timer?: { was?: number, now?: number },
 *   cells?: {
 *     at: { x: number, y: number } | { x: number, y: number }[],
 *     entry?: { was?: number, now?: number },
 *     corner?: { was?: number[], now?: number[] },
 *     center?: { was?: number[], now?: number[] },
 *     colors?: { was?: string[], now?: string[] },
 *   }[],
 * }} UndoableHistoryStep
 */

export default class UndoHistory {
  /** @type {UndoableHistoryStep[]} */ #log = [];
  /** @type {UndoableStateSnapshot | null} */ #snapshot = null;
  /** @type {number} The number of log entries which are in the past. #pointer = next entry to redo / one-betond the next entry to undo. Typically, this points to the end of the log AKA = log.length. */ #pointer = 0;

  beginTransaction(snapshot) {
    if (this.#snapshot != null) {
      warnOrThrow('Transaction already in progress');
    }
    this.#snapshot = snapshot;
  }

  commitTransaction(snapshot) {
    if (this.#snapshot == null) {
      warnOrThrow('No transaction in progress');
      return;
    }

    const diff = UndoHistory.diff(this.#snapshot, snapshot);
    if (diff != null) {
      // If we're in the past, this will overwrite a "future" entry beyond the pointer.
      this.#log[this.#pointer++] = diff;
      this.#log.length = this.#pointer; // Truncate all such future entries.
    }
    this.#snapshot = null;
  }

  /**
   * Returns the previous undoable history step, if any, and moves the pointer back.
   * The caller is responsible for applying the returned history step to the game state.
   */
  undo() {
    if (this.#pointer === 0) return null;
    return this.#log[--this.#pointer];
  }

  /**
   * Returns the next redoable history step, if any, and moves the pointer forward.
   * The caller is responsible for applying the returned history step to the game state.
   */
  redo() {
    if (this.#pointer >= this.#log.length) return null;
    return this.#log[this.#pointer++];
  }

  get canUndo() { return this.#pointer > 0; }
  get canRedo() { return this.#pointer < this.#log.length; }

  toSaveDataObject() {
    return {
      pointer: this.#pointer,
      log: this.#log,
    };
  }

  static rehydrate(data) {
    const history = new UndoHistory();

    history.#pointer = data.pointer;
    history.#log = structuredClone(data.log);

    return history;
  }

  /**
   * @param {UndoableStateSnapshot} before
   * @param {UndoableStateSnapshot} after
   * @returns {UndoableHistoryStep | null}
   */
  static diff(before, after) {
    if (before === after) return null;

    // Timer
    let timer = null;
    if (before.timer != null && after.timer != null && before.timer !== after.timer) {
      timer = {};
      if (before.timer !== 0) timer.was = before.timer;
      if (after.timer !== 0) timer.now = after.timer;
    }

    // Cells (entries, corner notes, center notes, colors)
    let rawCells = [];
    let anyCellResult = false;
    const maxY = Math.max(
      before.entries?.length ?? 0, after.entries?.length ?? 0,
      before.cellColors?.length ?? 0, after.cellColors?.length ?? 0,
      before.cornerNotes?.length ?? 0, after.cornerNotes?.length ?? 0,
      before.centerNotes?.length ?? 0, after.centerNotes?.length ?? 0
    );
    for (let y = 0; y < maxY; y++) {
      rawCells.push([]);

      const maxX = Math.max(
        before.entries?.[y]?.length ?? 0, after.entries?.[y]?.length ?? 0,
        before.cellColors?.[y]?.length ?? 0, after.cellColors?.[y]?.length ?? 0,
        before.cornerNotes?.[y]?.length ?? 0, after.cornerNotes?.[y]?.length ?? 0,
        before.centerNotes?.[y]?.length ?? 0, after.centerNotes?.[y]?.length ?? 0
      );
      for (let x = 0; x < maxX; x++) {
        let result = {};

        // Entry
        const beforeEntry = before.entries?.[y]?.[x] || null; // `||` not `??` because `0` and `null` are both used for empty cells
        const afterEntry = after.entries?.[y]?.[x] || null;
        if (beforeEntry !== afterEntry) {
          result.entry = {};
          if (beforeEntry !== null) result.entry.was = beforeEntry;
          if (afterEntry !== null) result.entry.now = afterEntry;
        }

        // Corner notes
        const beforeCorner = new Set(before.cornerNotes?.[y]?.[x] ?? []);
        const afterCorner = new Set(after.cornerNotes?.[y]?.[x] ?? []);
        if (!setEquals(beforeCorner, afterCorner)) {
          result.corner = {};
          if (beforeCorner.size > 0) result.corner.was = [...beforeCorner].sort(sort.numeric.ascending);
          if (afterCorner.size > 0) result.corner.now = [...afterCorner].sort(sort.numeric.ascending);
        }

        // Center notes
        const beforeCenter = new Set(before.centerNotes?.[y]?.[x] ?? []);
        const afterCenter = new Set(after.centerNotes?.[y]?.[x] ?? []);
        if (!setEquals(beforeCenter, afterCenter)) {
          result.center = {};
          if (beforeCenter.size > 0) result.center.was = [...beforeCenter].sort(sort.numeric.ascending);
          if (afterCenter.size > 0) result.center.now = [...afterCenter].sort(sort.numeric.ascending);
        }

        // Colors
        const beforeColors = new Set(before.cellColors?.[y]?.[x] ?? []);
        const afterColors = new Set(after.cellColors?.[y]?.[x] ?? []);
        if (!setEquals(beforeColors, afterColors)) {
          result.colors = {};
          if (beforeColors.size > 0) result.colors.was = CellColorSet.sortCanonical(beforeColors);
          if (afterColors.size > 0) result.colors.now = CellColorSet.sortCanonical(afterColors);
        }

        if (Object.keys(result).length === 0) {
          result = null;
        } else {
          anyCellResult = true;
        }
        rawCells[y].push(result);
      }
    }

    let cells = [];
    if (anyCellResult) {
      // Clean up the rawCells into a compact form, by merging multiple cells with identical payloads (same result object)

      const map = new Map();
      for (let y = 0; y < rawCells.length; y++) {
        for (let x = 0; x < rawCells[y].length; x++) {
          const payload = rawCells[y][x];
          if (payload === null) continue;

          const key = JSON.stringify(payload);

          if (!map.has(key)) {
            const descriptor = { at: { x, y }, ...payload };
            map.set(key, descriptor);
            cells.push(descriptor);
          } else {
            const existing = map.get(key);
            existing.at = ensureArray(existing.at);
            existing.at.push({ x, y });
          }
        }
      }
    }

    if (timer == null && !anyCellResult) return null;

    const result = {};
    if (timer != null) result.timer = timer;
    if (anyCellResult) result.cells = cells;
    return result;
  }
}