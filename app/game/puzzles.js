import { randomArrayElement } from "../util/random.js";

const puzzleConfigs = [{
  title: 'Template',
  id: null,
  exclude: true, // This puzzle won't be provided by the random puzzle selection.
  size: { x: 9, y: 9 },
  given: [
    '         ',
    '         ',
    '         ',
    '         ',
    '         ',
    '         ',
    '         ',
    '         ',
    '         ',
  ],
}, {
  title: 'Test Puzzle #1',
  id: 'test-puzzle-1',
  size: { x: 9, y: 9 },
  given: [
    '  6814 97',
    ' 812    4',
    '274  98 1',
    '3584  7 9',
    '    57 2 ',
    ' 4    315',
    '  563817 ',
    '62  4  8 ',
    '  37925 6',
  ],
}, {
  title: 'Test EZ Win',
  id: 'test-ez-win',
  exclude: true, // This puzzle won't be provided by the random puzzle selection.
  size: { x: 9, y: 9 },
  given: [
    ' 23456789',
    '456789123',
    '789123456',
    '912345678',
    '678912345',
    '345678912',
    '891234567',
    '567891234',
    '234567891',
  ],
}, {
  title: 'Test Full',
  id: 'test-full',
  exclude: true, // This puzzle won't be provided by the random puzzle selection.
  size: { x: 9, y: 9 },
  given: [
    '123456789',
    '456789123',
    '789123456',
    '912345678',
    '678912345',
    '345678912',
    '891234567',
    '567891234',
    '234567891',
  ],
}, {
  title: "Ahriman's Eye",
  id: 'test-puzzle-2',
  size: { x: 9, y: 9 },
  given: [
    '53  7    ',
    '6  195   ',
    ' 98    6 ',
    '8   6   3',
    '4  8 3  1',
    '7   2   6',
    ' 6    28 ',
    '   419  5',
    '    8  79',
  ],
}, {
  title: 'Test Puzzle #3',
  id: 'test-puzzle-3',
  size: { x: 9, y: 9 },
  given: [
    '168   9 2',
    '   3 1   ',
    ' 3 62    ',
    '  9   1 6',
    '  1   37 ',
    ' 435    9',
    '   8 26  ',
    '   9 5 23',
    '2 6 3 7  ',
  ],
}, {
  title: 'The Lantern',
  id: 'test-puzzle-4',
  size: { x: 9, y: 9 },
  given: [
    '1   8   9',
    ' 5 6 1 2 ',
    '   5 3   ',
    ' 961 483 ',
    '3   6   5',
    ' 159 846 ',
    '   7 5   ',
    ' 8 3 9 7 ',
    '5   1   3',
  ],
}, {
  title: 'Test Puzzle #5',
  id: 'test-puzzle-5',
  size: { x: 9, y: 9 },
  given: [
    '9854 1   ',
    '    3    ',
    '1 6      ',
    '   5     ',
    '4 2  9  3',
    ' 9  634  ',
    ' 6  1    ',
    '   3 6  5',
    '2   8   1',
  ],
}, {
  title: 'Test Puzzle #6',
  id: 'test-puzzle-6',
  size: { x: 9, y: 9 },
  given: [
    ' 3     4 ',
    '54  71 2 ',
    '   3    6',
    '  8  9   ',
    '3 2      ',
    ' 1   7  3',
    '       89',
    '7859     ',
    '   5   62',
  ],
}, {
  title: 'Test Puzzle #7',
  id: 'test-puzzle-7',
  size: { x: 9, y: 9 },
  given: [
    '1 6  9   ',
    ' 2   8 6 ',
    ' 43  1   ',
    '9   7   1',
    ' 8       ',
    '   2  34 ',
    '    9   7',
    '6      1 ',
    ' 9  4 8  ',
  ],
}, {
  title: 'Test Puzzle #8',
  id: 'test-puzzle-8',
  size: { x: 9, y: 9 },
  given: [
    '8 134  2 ',
    ' 5 6  8 3',
    '    951  ',
    '6   59  4',
    '  3   75 ',
    '  523 68 ',
    '  95 84 6',
    '57 1  2 8',
    '3 6      ',
  ],
}, {
  title: 'Test Puzzle #9',
  id: 'test-puzzle-9',
  size: { x: 9, y: 9 },
  given: [
    '9 31   4 ',
    ' 5    6 1',
    '8    47 3',
    '   78 4  ',
    '18 64 93 ',
    '  65   1 ',
    '   9 72  ',
    '   4  1  ',
    ' 1     54',
  ],
}, {
  title: 'The Egg',
  id: 'test-puzzle-10',
  size: { x: 9, y: 9 },
  given: [
    '  17 29  ',
    '87     42',
    '    4    ',
    '6   5 7 9',
    '7   1   3',
    '4 2 8   1',
    '    6    ',
    '23     16',
    '  45 38  ',
  ],
}, {
  title: 'Bar of Soap',
  id: 'test-puzzle-11',
  size: { x: 9, y: 9 },
  given: [
    '    376  ',
    '   6   9 ',
    '  8     4',
    ' 9      1',
    '6       9',
    '3      4 ',
    '7     8  ',
    ' 1   9   ',
    '  254    ',
  ],
}, {
  title: 'Bull',
  id: 'test-puzzle-12',
  size: { x: 9, y: 9 },
  given: [
    '  9   8  ',
    ' 6     4 ',
    '3  142  9',
    ' 14   96 ',
    '  56 97  ',
    '  8   2  ',
    '  6   3  ',
    '   9 5   ',
    '    1    ',
  ],
}, {
  title: 'Cinch',
  id: 'test-puzzle-13',
  size: { x: 9, y: 9 },
  given: [
    '5  2   4 ',
    '   6 3   ',
    ' 3   9  7',
    '  3  7   ',
    '  7  8   ',
    '6      2 ',
    ' 8      3',
    '   4  6  ',
    '   1  5  ',
  ],
}, {
  title: 'Test Puzzle #14',
  id: 'test-puzzle-14',
  size: { x: 9, y: 9 },
  given: [
    '7  1 8   ',
    ' 9     32',
    '     5   ',
    '      1  ',
    '96  2    ',
    '      8  ',
    '         ',
    '  5  1   ',
    '32      6',
  ],
// }, {
  // title: 'Artisanal "Daily" Puzzle',
  // id: 'artisanal-daily-puzzle',
  // size: { x: 6, y: 6 },
  // given: [
  //   '7     ',
  //   '   7  ',
  //   ' 7    ',
  //   '    7 ',
  //   '  7   ',
  //   '      ',
  // ],
  // constraints: [], // TODO: completion-7s (place only the 7s to complete), king's (same-numerals cannot be adjacent diagonally), alternate boxes (custom box locations)
}, {
  title: 'LT1',
  id: 'lt1',
  difficulty: 1,
  givens: [
    '6 3 1 5  ',
    '   7  382',
    '  2  91  ',
    '  19  6 8',
    '  64 1 5 ',
    '    5    ',
    '13      5',
    ' 698  42 ',
    ' 7    96 ',
  ],
}, {
  title: 'Bg1',
  id: 'bg1',
  difficulty: 1,
  givens: [
    ' 2 7  8  ',
    '  8 94   ',
    '4 3   56 ',
    '   2   3 ',
    ' 514  2  ',
    '9 265 4 7',
    '2     3  ',
    '  4 8  7 ',
    ' 8 9    1',
  ],
}, {
  title: 'Bg2',
  id: 'bg2',
  difficulty: 1,
  givens: [
    '78  614  ',
    '   38 9  ',
    '3   97 82',
    ' 93  8 24',
    '    3  1 ',
    '41 72 563',
    '1    3 5 ',
    ' 54  2   ',
    ' 3 8 56 7',
  ],
}, {
  title: '241',
  id: '241',
  difficulty: 1,
  givens: [
    '  4 37951',
    ' 5       ',
    '  8651 4 ',
    '8  4921  ',
    '        2',
    '4325 67  ',
    '  392 5  ',
    '5    8 9 ',
    '  937 6  ',
  ],
}, {
  title: '242',
  id: '242',
  difficulty: 1,
  givens: [
    '5   7    ',
    ' 193 27 6',
    '3      4 ',
    '  18 54 2',
    '   7 419 ',
    '874   3  ',
    '    276 4',
    ' 3 5 68 7',
    '746  3   ',
  ],
}, {
  title: 'Ms1',
  id: 'ms1',
  difficulty: 1,
  givens: [
    '3   657 2',
    '7    35  ',
    ' 5279  68',
    ' 614     ',
    '8  91 47 ',
    '       13',
    ' 43 2 187',
    ' 9      5',
    '  715893 ',
  ],
}, {
  title: 'Bgm1',
  id: 'bgm1',
  difficulty: 2,
  notes: 'this is a really fun medium puzzle',
  givens: [
    '     1   ',
    ' 9  5  81',
    '   4   79',
    '61       ',
    '7   3 8  ',
    '      6 4',
    '         ',
    '3 5      ',
    '429 7 3  ',
  ],
}, {
  title: 'Ltm1',
  id: 'ltm1',
  difficulty: 2,
  givens: [
    '    41  3',
    ' 4   8 9 ',
    '      5  ',
    '57       ',
    ' 82  73  ',
    '  3 1    ',
    '92    865',
    '   8  2  ',
    '  7  91  ',
  ],
}, {
  title: 'Ltm2',
  id: 'ltm2',
  difficulty: 2,
  givens: [
    '  9  4   ',
    '3 7    9 ',
    '2       5',
    ' 8  6  3 ',
    ' 51  2   ',
    '  3  5 74',
    '    81  9',
    '    5 78 ',
    '         ',
  ],
}, {
  title: 'Lth1',
  id: 'lth1',
  difficulty: 3,
  givens: [
    '6     9 2',
    '         ',
    '3  9  5  ',
    ' 6  7    ',
    '7  4    8',
    '  4  132 ',
    '  2    4 ',
    '  8 16   ',
    ' 7  2  95',
  ],
}, {
  title: 'Lth2',
  id: 'lth2',
  difficulty: 3,
  givens: [
    '  3   9  ',
    '     1   ',
    '6  3     ',
    '562      ',
    '4       8',
    '    9 752',
    ' 4  7  9 ',
    '  8  64  ',
    '9   8  35',
  ],
}];
export default puzzleConfigs;

export function selectRandomPuzzleId(difficulty) {
  const all = getAllPuzzlesWithDifficulty(difficulty);
  if (!all?.length) return null;
  return randomArrayElement(all).id;
}

export function anyPuzzlesExistWithDifficulty(difficulty) {
  const includedPuzzles = puzzleConfigs.filter(config => !config.exclude);
  if (includedPuzzles.length === 0) return false;

  return includedPuzzles.some(config => config.difficulty === difficulty);
}

export function getAllPuzzlesWithDifficulty(difficulty) {
  const includedPuzzles = puzzleConfigs.filter(config => !config.exclude);
  if (includedPuzzles.length === 0) return null;

  if (difficulty === undefined) return includedPuzzles;
  if (difficulty === null) return includedPuzzles.filter(config => config.difficulty == null);
  return includedPuzzles.filter(config => config.difficulty === difficulty);
}

/**
 * Initializes a new Sudoku board with the given size and initial numerals.
 * @param {*} param0 The parameter object.
 * @param {string} param0.title The title of the puzzle.
 * @param {{ x: number, y: number }} param0.size
 * @param {string[]} param0.given A list of strings each representing a board row. Numerals are used for given values, and spaces represent non-given (empty) cells.
 */
function validatePuzzleConfig({ title, size = { x: 9, y: 9 }, given }) {
  const warnings = [];

  if (!size) throw new Error(`Missing size for puzzle "${title}".`);
  if (!size.x || !size.y) throw new Error(`Invalid size for puzzle "${title}".`);

  if (given) {
    // `given` should be an array, with one element per row of the board.
    if (given.length !== size.y) throw new Error(`Invalid number of rows in puzzle "${title}" \`given\`.`);

    // Each element of `given` should be a string with length equal to the number of columns in the board.
    for (let y = 0; y < size.y; y++) {
      if (typeof given[y] !== 'string' || given[y].length !== size.x) {
        throw new Error(`Invalid row length in puzzle "${title}" \`given\`: '${given[y]}' (length ${given[y].length}) at row ${y}, expected length ${size.x}.`);
      }

      // If the string contains any characters other than digits or spaces, issue a warning.
      if (/[^0-9 ]/.test(given[y])) {
        warnings.push(`Invalid character in puzzle "${title}" \`given\` at row ${y}. Only digits and spaces are allowed.`);
      }
    }
  }

  return warnings;
}

function validateAllPuzzleConfigs(puzzleConfigs) {
  const count = puzzleConfigs.length;
  let pass = 0, warned = 0, fail = 0;

  for (const config of puzzleConfigs) {
    try {
      const warnings = validatePuzzleConfig(config);
      if (warnings.length > 0) {
        warned++;
        console.warn(`Puzzle definition warnings: "${config.title}":`, warnings);
      }
      pass++;
    } catch (error) {
      console.error(`Puzzle definition validation error: "${config.title}":`, error);
      fail++;
    }
  }

  console.log(`Puzzle validation complete. Total: ${count}, Passed: ${pass}, Warned: ${warned}, Failed: ${fail}`);
}

validateAllPuzzleConfigs(puzzleConfigs);