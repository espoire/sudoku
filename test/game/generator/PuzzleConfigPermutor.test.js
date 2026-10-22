import PuzzleConfigPermutor from "../../../app/game/generator/PuzzleConfigPermutor.js";
import { array, fillFrom, memberwiseEquals } from "../../../app/util/Array.js";
import { randomArrayElement } from "../../../app/util/random.js";
import { sort } from "../../../app/util/sort.js";
import { errorMaybe, runFunctionalTests } from "../../TestHelpers.js";

export function runPuzzleConfigPermutorTests() {
  runFunctionalTests('PuzzleConfigPermutor', [
    test_shuffleBoxRows,
    test_shuffleBoxColumns,
    test_shuffleRowsWithinBoxGroups,
    test_shuffleColumnsWithinBoxGroups,
    test_substituteDigits,
    test_mirror,
    test_rotate,

    test_multiplePermutation,
  ]);
}

const blockyInput = [
  [1, 1, 1, 2, 2, 2, 3, 3, 3],
  [1, 1, 1, 2, 2, 2, 3, 3, 3],
  [1, 1, 1, 2, 2, 2, 3, 3, 3],
  [4, 4, 4, 5, 5, 5, 6, 6, 6],
  [4, 4, 4, 5, 5, 5, 6, 6, 6],
  [4, 4, 4, 5, 5, 5, 6, 6, 6],
  [7, 7, 7, 8, 8, 8, 9, 9, 9],
  [7, 7, 7, 8, 8, 8, 9, 9, 9],
  [7, 7, 7, 8, 8, 8, 9, 9, 9],
];

function _expect(permuted, expectedOptions, label) {
  const errors = [];

  let somePass = false;
  for (const expected of expectedOptions) {
    if (memberwiseEquals(permuted, expected)) {
      somePass = true;
      break;
    }
  }

  if (!somePass) {
    errors.push(`Permuted configuration did not match any expected arrangement for ${label}.`);
  }

  // Report result
  errorMaybe(`PuzzleConfigPermutor:${label}`, errors);
  return errors;
}

function test_shuffleBoxRows() {
  const input = structuredClone(blockyInput);
  const permuted = PuzzleConfigPermutor.shuffleBoxRows(input, [2, 0, 1]);

  const expectedOptions = [
    [
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
    ],
    [
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
    ],
    [
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
    ],
    [
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
    ],
    [
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
    ],
    [
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
    ],
  ];
  
  return _expect(permuted, expectedOptions, 'shuffleBoxRows');
}

function test_shuffleBoxColumns() {
  const input = structuredClone(blockyInput);
  const permuted = PuzzleConfigPermutor.shuffleBoxColumns(input, [2, 0, 1]);

  const expectedOptions = [
    [
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
    ],
    [
      [1, 1, 1, 3, 3, 3, 2, 2, 2],
      [1, 1, 1, 3, 3, 3, 2, 2, 2],
      [1, 1, 1, 3, 3, 3, 2, 2, 2],
      [4, 4, 4, 6, 6, 6, 5, 5, 5],
      [4, 4, 4, 6, 6, 6, 5, 5, 5],
      [4, 4, 4, 6, 6, 6, 5, 5, 5],
      [7, 7, 7, 9, 9, 9, 8, 8, 8],
      [7, 7, 7, 9, 9, 9, 8, 8, 8],
      [7, 7, 7, 9, 9, 9, 8, 8, 8],
    ],
    [
      [2, 2, 2, 1, 1, 1, 3, 3, 3],
      [2, 2, 2, 1, 1, 1, 3, 3, 3],
      [2, 2, 2, 1, 1, 1, 3, 3, 3],
      [5, 5, 5, 4, 4, 4, 6, 6, 6],
      [5, 5, 5, 4, 4, 4, 6, 6, 6],
      [5, 5, 5, 4, 4, 4, 6, 6, 6],
      [8, 8, 8, 7, 7, 7, 9, 9, 9],
      [8, 8, 8, 7, 7, 7, 9, 9, 9],
      [8, 8, 8, 7, 7, 7, 9, 9, 9],
    ],
    [
      [2, 2, 2, 3, 3, 3, 1, 1, 1],
      [2, 2, 2, 3, 3, 3, 1, 1, 1],
      [2, 2, 2, 3, 3, 3, 1, 1, 1],
      [5, 5, 5, 6, 6, 6, 4, 4, 4],
      [5, 5, 5, 6, 6, 6, 4, 4, 4],
      [5, 5, 5, 6, 6, 6, 4, 4, 4],
      [8, 8, 8, 9, 9, 9, 7, 7, 7],
      [8, 8, 8, 9, 9, 9, 7, 7, 7],
      [8, 8, 8, 9, 9, 9, 7, 7, 7],
    ],
    [
      [3, 3, 3, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 1, 1, 1, 2, 2, 2],
      [6, 6, 6, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 4, 4, 4, 5, 5, 5],
      [9, 9, 9, 7, 7, 7, 8, 8, 8],
      [9, 9, 9, 7, 7, 7, 8, 8, 8],
      [9, 9, 9, 7, 7, 7, 8, 8, 8],
    ],
    [
      [3, 3, 3, 2, 2, 2, 1, 1, 1],
      [3, 3, 3, 2, 2, 2, 1, 1, 1],
      [3, 3, 3, 2, 2, 2, 1, 1, 1],
      [6, 6, 6, 5, 5, 5, 4, 4, 4],
      [6, 6, 6, 5, 5, 5, 4, 4, 4],
      [6, 6, 6, 5, 5, 5, 4, 4, 4],
      [9, 9, 9, 8, 8, 8, 7, 7, 7],
      [9, 9, 9, 8, 8, 8, 7, 7, 7],
      [9, 9, 9, 8, 8, 8, 7, 7, 7],
    ],
  ];
  
  return _expect(permuted, expectedOptions, 'shuffleBoxColumns');
}

function test_shuffleRowsWithinBoxGroups() {
  const input = structuredClone(blockyInput);
  const permuted = PuzzleConfigPermutor.shuffleRowsWithinBoxGroups(input);

  return _expect(permuted, [input], 'shuffleRowsWithinBoxGroups');
}

function test_shuffleColumnsWithinBoxGroups() {
  const input = structuredClone(blockyInput);
  const permuted = PuzzleConfigPermutor.shuffleColumnsWithinBoxGroups(input);

  return _expect(permuted, [input], 'shuffleColumnsWithinBoxGroups');
}

function test_rotate() {
  const input = structuredClone(blockyInput);
  const permuted = PuzzleConfigPermutor.rotate(input);

  const expectedOptions = [
    [
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
    ],
    [
      [7, 7, 7, 4, 4, 4, 1, 1, 1],
      [7, 7, 7, 4, 4, 4, 1, 1, 1],
      [7, 7, 7, 4, 4, 4, 1, 1, 1],
      [8, 8, 8, 5, 5, 5, 2, 2, 2],
      [8, 8, 8, 5, 5, 5, 2, 2, 2],
      [8, 8, 8, 5, 5, 5, 2, 2, 2],
      [9, 9, 9, 6, 6, 6, 3, 3, 3],
      [9, 9, 9, 6, 6, 6, 3, 3, 3],
      [9, 9, 9, 6, 6, 6, 3, 3, 3],
    ],
    [
      [9, 9, 9, 8, 8, 8, 7, 7, 7],
      [9, 9, 9, 8, 8, 8, 7, 7, 7],
      [9, 9, 9, 8, 8, 8, 7, 7, 7],
      [6, 6, 6, 5, 5, 5, 4, 4, 4],
      [6, 6, 6, 5, 5, 5, 4, 4, 4],
      [6, 6, 6, 5, 5, 5, 4, 4, 4],
      [3, 3, 3, 2, 2, 2, 1, 1, 1],
      [3, 3, 3, 2, 2, 2, 1, 1, 1],
      [3, 3, 3, 2, 2, 2, 1, 1, 1],
    ],
    [
      [3, 3, 3, 6, 6, 6, 9, 9, 9],
      [3, 3, 3, 6, 6, 6, 9, 9, 9],
      [3, 3, 3, 6, 6, 6, 9, 9, 9],
      [2, 2, 2, 5, 5, 5, 8, 8, 8],
      [2, 2, 2, 5, 5, 5, 8, 8, 8],
      [2, 2, 2, 5, 5, 5, 8, 8, 8],
      [1, 1, 1, 4, 4, 4, 7, 7, 7],
      [1, 1, 1, 4, 4, 4, 7, 7, 7],
      [1, 1, 1, 4, 4, 4, 7, 7, 7],
    ],
  ];

  return _expect(permuted, expectedOptions, 'rotate');
}

function test_mirror() {
  const input = structuredClone(blockyInput);
  const permuted = PuzzleConfigPermutor.mirror(input);

  const expectedOptions = [
    [
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
    ],
    [
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [7, 7, 7, 8, 8, 8, 9, 9, 9],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [4, 4, 4, 5, 5, 5, 6, 6, 6],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
      [1, 1, 1, 2, 2, 2, 3, 3, 3],
    ],
  ];

  return _expect(permuted, expectedOptions, 'mirror');
}

function test_substituteDigits() {
  const errors = [];
  
  const input = structuredClone(blockyInput);
  const permuted = PuzzleConfigPermutor.substituteDigits(input);

  // Too many permutations to enumerate here,
  // instead will check grid contains exactly 9 of each digit.

  const digitCounts = Array(10).fill(0);

  for (const row of permuted) {
    for (const cell of row) {
      digitCounts[cell]++;
    }
  }

  for (let i = 1; i <= 9; i++) {
    if (digitCounts[i] !== 9) {
      errors.push(`Digit ${i} appears ${digitCounts[i]} times instead of 9`);
    }
  }

  errorMaybe('PuzzleConfigPermutor.substituteDigits', errors);
  return errors;
}


/**
 * Runs a combined test of the PuzzleConfigPermutor,
 * applying all permutations via .permuteGivensMap() to a sample input and
 * verifying the results still contain the same different counts of digits.
 * 
 * That is, if the input contained 7 9s, 4 5s, 2 6s, and 1 each of 1s 2s and 4s,
 * then the output should contain 7 of [some digit], 4 of [some digit],
 * 2 of [some digit], and 1 of three different [some digit]s.
 */
function test_multiplePermutation() {
  const errors = [];

  const input = array(9, 9);
  fillFrom(input, () => randomArrayElement([' ', 1, 2, 3, 4, 5, 6, 7, 8, 9]));

  const permuted = PuzzleConfigPermutor.permuteGivensMap(input);

  const inputDigitCounts = Array(10).fill(0);
  for (const row of input) {
    for (const cell of row) {
      inputDigitCounts[cell]++;
    }
  }

  const permutedDigitCounts = Array(10).fill(0);
  for (const row of permuted) {
    for (const cell of row) {
      permutedDigitCounts[cell]++;
    }
  }

  const sortedInputCounts = structuredClone(inputDigitCounts).sort(sort.numeric.descending);
  const sortedPermutedCounts = structuredClone(permutedDigitCounts).sort(sort.numeric.descending);

  if (!memberwiseEquals(sortedInputCounts, sortedPermutedCounts)) {
    errors.push(`Digit count mismatch: input: [${sortedInputCounts}], permuted: [${sortedPermutedCounts}]`);
  // } else {
  //   console.log(`Digit counts match:`);
  //   console.log(`  input: ${prettyFormat2DRectArray(input)}`);
  //   console.log(`  input count: [${inputDigitCounts}]`);
  //   console.log(`  input sorted count: [${sortedInputCounts}]`);
  //   console.log(`  permuted: ${prettyFormat2DRectArray(permuted)}`);
  //   console.log(`  permuted count: [${permutedDigitCounts}]`);
  //   console.log(`  permuted sorted count: [${sortedPermutedCounts}]`);
  }

  errorMaybe('PuzzleConfigPermutor.multiplePermutation', errors);
  return errors;
}