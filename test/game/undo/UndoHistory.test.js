import { CellColorSet } from "../../../app/game/board/CellColor.js";
import UndoHistory from "../../../app/game/undo/UndoHistory.js";
import { deepEquals } from "../../../app/util/object.js";
import { errorMaybe, runFunctionalTests } from "../../TestHelpers.js";

export function runUndoHistoryTests() {
  runFunctionalTests('UndoHistory', [
    test_diffCases,
    test_diffUnchangedBySerialization,
  ]);
}

// System will accept partial before/after objects, as a concession for test case syntactic sugar
// Diff checking absent keys is trivial anyway; undefined == undefined.
const diffTestCases = [{
  label: 'Non-change returns null',
  before: {},
  after: {},
  expect: null,
}, {
  label: 'Arrays are [y][x] -- rows of columns',
  before: { entries: [[], [1]] },
  after: { entries: [[], [2]] },
  expect: { cells: [{ at: { x: 0, y: 1 }, entry: { was: 1, now: 2 } }] },

// Entries
}, {
  label: 'We accept 0 and null equivalently for entries (test case syntactic sugar)',
  before: { entries: [[null]] },
  after: { entries: [[0]] },
  expect: null,
}, {
  label: 'Change returns array of affected cells diff objects',
  before: { entries: [[1]] },
  after: { entries: [[2]] },
  expect: { cells: [{ at: { x: 0, y: 0}, entry: { was: 1, now: 2 } }] },
}, {
  label: 'If an entry was/now value would be zero/nullish, omit the key',
  before: { entries: [[0]] },
  after: { entries: [[2]] },
  expect: { cells: [{ at: { x: 0, y: 0}, entry: { now: 2 } }] },

// Corner notes
}, {
  label: 'Corner note added',
  before: { cornerNotes: [[[]]] },
  after: { cornerNotes: [[[2]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, corner: { now: [2] } }] },
}, {
  label: 'Corner note removed',
  before: { cornerNotes: [[[1]]] },
  after: { cornerNotes: [[[]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, corner: { was: [1] } }] },
}, {
  label: 'Corner note changed',
  before: { cornerNotes: [[[1]]] },
  after: { cornerNotes: [[[2]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, corner: { was: [1], now: [2] } }] },
}, {
  label: 'Corner note unchanged',
  before: { cornerNotes: [[[1]]] },
  after: { cornerNotes: [[[1]]] },
  expect: null,
}, {
  label: 'Same corner notes, different input order: not a change',
  before: { cornerNotes: [[[1, 2]]] },
  after: { cornerNotes: [[[2, 1]]] },
  expect: null,
}, {
  label: 'Corner note output is sorted, regardless of input order',
  before: { cornerNotes: [[[2, 1]]] },
  after: { cornerNotes: [[[]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, corner: { was: [1, 2] } }] },
}, {

// Center notes
}, {
  label: 'Center note added',
  before: { centerNotes: [[[]]] },
  after: { centerNotes: [[[2]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, center: { now: [2] } }] },
}, {
  label: 'Center note removed',
  before: { centerNotes: [[[1]]] },
  after: { centerNotes: [[[]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, center: { was: [1] } }] },
}, {
  label: 'Center note changed',
  before: { centerNotes: [[[1]]] },
  after: { centerNotes: [[[2]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, center: { was: [1], now: [2] } }] },
}, {
  label: 'Center note unchanged',
  before: { centerNotes: [[[1]]] },
  after: { centerNotes: [[[1]]] },
  expect: null,
}, {
  label: 'Same center notes, different input order: not a change',
  before: { centerNotes: [[[1, 2]]] },
  after: { centerNotes: [[[2, 1]]] },
  expect: null,
}, {
  label: 'Center note output is sorted, regardless of input order',
  before: { centerNotes: [[[2, 1]]] },
  after: { centerNotes: [[[]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, center: { was: [1, 2] } }] },
}, {

// Colors
}, {
  label: 'Color added',
  before: { cellColors: [[[]]] },
  after: { cellColors: [[['c2']]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, colors: { now: ['c2'] } }] },
}, {
  label: 'Color changed',
  before: { cellColors: [[['c1']]] },
  after: { cellColors: [[['c2']]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, colors: { was: ['c1'], now: ['c2'] } }] },
}, {
  label: 'Color removed',
  before: { cellColors: [[['c1']]] },
  after: { cellColors: [[[]]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, colors: { was: ['c1'] } }] },
}, {
  label: 'Same colors, different input order: not a change',
  before: { cellColors: [[['c1', 'c5', 'theme', 'b2']]] },
  after: { cellColors: [[['b2', 'c1', 'c5', 'theme']]] },
  expect: null,
}, {
  label: 'Color output uses canonical order (c1, b1, c2, b2, ..., c9, b9, theme), regardless of input order',
  before: { cellColors: [[['c1', 'c5', 'theme', 'b2']]] },
  after: { cellColors: [[['b4', 'b5', 'c8', 'c2']]] },
  expect: { cells: [{ at: { x: 0, y: 0 }, colors: { was: ['c1', 'b2', 'c5', 'theme'], now: ['c2', 'b4', 'b5', 'c8'] } }] },

// Grouping
}, {
  label: 'Identical changes merge into one record with a row-major sorted `at` array',
  before: { entries: [[1, 1, 2, 2], [1, 1, 2, 2]] },
  after: { entries: [[3, 3, 3, 3], [3, 3, 3, 3]] },
  expect: {
    cells: [{
      at: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      entry: { was: 1, now: 3 },
    }, {
      at: [{ x: 2, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
      entry: { was: 2, now: 3 },
    }],
  },
}, {
  label: 'Partially-identical payloads do not merge (same entry change, different notes change)',
  before: { entries: [[1, 1]], centerNotes: [[[1], [2]]] },
  after: { entries: [[2, 2]], centerNotes: [[[3], [3]]] },
  expect: {
    cells: [{
      at: { x: 0, y: 0 },
      entry: { was: 1, now: 2 },
      center: { was: [1], now: [3] },
    }, {
      at: { x: 1, y: 0 },
      entry: { was: 1, now: 2 },
      center: { was: [2], now: [3] },
    }],
  },
}, {
  label: 'Multi-field-identical changes can merge',
  before: { entries: [[1, 1]], centerNotes: [[[2], [2]]] },
  after: { entries: [[2, 2]], centerNotes: [[[3], [3]]] },
  expect: {
    cells: [{
      at: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      entry: { was: 1, now: 2 },
      center: { was: [2], now: [3] },
    }],
  },

// Timer
}, {
  label: 'A timer difference may be included',
  before: { timer: 123 },
  after: { timer: 456 },
  expect: { timer: { was: 123, now: 456 } },
}, {
  label: 'Equal timers are not a difference',
  before: { timer: 123 },
  after: { timer: 123 },
  expect: null,
}, {
  label: "If either timer value is nullish, we don't treat that as a timer difference, pt 1",
  before: { timer: null },
  after: { timer: 123 },
  expect: null,
}, {
  label: "If either timer value is nullish, we don't treat that as a timer difference, pt 2",
  before: { timer: 123 },
  after: { timer: null },
  expect: null,
}, {
  label: "If either timer value is nullish, we don't treat that as a timer difference, pt 3",
  before: { timer: null },
  after: { timer: null },
  expect: null,
}, {
  label: 'An absent `timer` key is a nullish timer',
  before: {},
  after: { timer: 123 },
  expect: null,
}, {
  label: 'If a timer `was` value would be zero, omit the key',
  before: { timer: 0 },
  after: { timer: 456 },
  expect: { timer: { now: 456 } },
}, {
  label: 'If a timer `now` value would be zero, omit the key',
  before: { timer: 123 },
  after: { timer: 0 },
  expect: { timer: { was: 123 } },
}, {
  label: 'Timer changes can be combined with cells changes',
  before: { timer: 123, entries: [[1]] },
  after: { timer: 456, entries: [[2]] },
  expect: {
    timer: { was: 123, now: 456 },
    cells: [{
      at: { x: 0, y: 0 },
      entry: { was: 1, now: 2 },
    }],
  },

// Misc
}, {
  label: 'Absent key assumes empty cells',
  before: {},
  after: { entries: [[1]], cornerNotes: [[[2]]], centerNotes: [[[3]]], cellColors: [[['c4']]] },
  expect: {
    cells: [{
      at: { x: 0, y: 0 },
      entry: { now: 1 },
      corner: { now: [2] },
      center: { now: [3] },
      colors: { now: ['c4'] },
    }],
  },
}, {
  label: 'Mismatched grid dimensions assume missing cells are empty',
  before: { entries: [[1, 2]] },
  after: { entries: [[1], [2]] },
  expect: {
    cells: [{
      at: { x: 1, y: 0 },
      entry: { was: 2 },
    }, {
      at: { x: 0, y: 1 },
      entry: { now: 2 },
    }],
  },

// Production-like
}, {
  label: 'Production passes `Set`s for notes',
  before: { cornerNotes: [[new Set([1])]], centerNotes: [[new Set([2])]] },
  after: { cornerNotes: [[new Set([2])]], centerNotes: [[new Set([1])]] },
  expect: {
    cells: [{
      at: { x: 0, y: 0 },
      corner: { was: [1], now: [2] },
      center: { was: [2], now: [1] },
    }],
  },
}, {
  label: 'Production passes `CellColorSet`s for cell colors',
  before: { cellColors: [[CellColorSet.rehydrate(['c1'])]] },
  after: { cellColors: [[CellColorSet.rehydrate(['c2'])]] },
  expect: {
    cells: [{
      at: { x: 0, y: 0 },
      colors: { was: ['c1'], now: ['c2'] },
    }],
  },
}];

function test_diffCases() {
  const errors = [];
  const tests = diffTestCases;

  let skipped = 0;
  for (let { label, before, after, expect, debug } of tests) {
    if (debug) debugger;

    if (!before && !after) {
      skipped++;
      continue;
    }

    try {
      const actual = UndoHistory.diff(before, after);
      if (!deepEquals(expect, actual)) {
        errors.push(`${label}: Incorrect diff, expected: ${JSON.stringify(expect)}, actual: ${JSON.stringify(actual)}`);
      }
    } catch (e) {
      errors.push(`${label}: Uncaught error: ${e.message}`);
    }
  }

  errorMaybe(`UndoHistory::diff`, errors);
  return {
    cases: tests.length - skipped,
    errors,
  }
}

function test_diffUnchangedBySerialization() {
  const errors = [];
  const tests = diffTestCases;

  let skipped = 0;
  for (let { label, before, after, debug } of tests) {
    if (debug) debugger;

    if (!before && !after) {
      skipped++;
      continue;
    }

    try {
      const result = UndoHistory.diff(before, after);
      const serialized = JSON.stringify(result);
      const deserialized = JSON.parse(serialized);
      if (!deepEquals(result, deserialized)) {
        errors.push(`${label}: Diff changed after serialization, serialized: ${serialized}, deserialized: ${JSON.stringify(deserialized)}`);
      }
    } catch (e) {
      errors.push(`${label}: Uncaught error: ${e.message}`);
    }
  }

  errorMaybe(`UndoHistory::diffUnchangedBySerialization`, errors);
  return {
    cases: tests.length - skipped,
    errors,
  }
}