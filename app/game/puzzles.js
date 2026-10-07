export const puzzleConfigs = [{
  title: 'Template',
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
}];


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