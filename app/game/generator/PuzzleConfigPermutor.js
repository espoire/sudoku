import { array, arrShuffleInPlace, fillFrom } from "../../util/Array.js";
import { randBool, randInt } from "../../util/random.js";

export default class PuzzleConfigPermutor {
  /**
   * Partially-loads a puzzle config, permutes the `given` numerals,
   * and returns a new valid (probably) different puzzle config object.
   * @param {*} config
   * @returns {*} A new puzzle config object with permuted `given` numerals.
   */
  static permute(config) {
    if ((config.size?.x ?? 9) !== 9 || (config.size?.y ?? 9) !== 9) return config; // Only support 9x9 puzzles for now.
    const given = config.given ?? config.givens;

    let givensMap = array(9, 9);
    fillFrom(givensMap, (y, x) => given?.[y]?.[x] ?? ' ');

    givensMap = PuzzleConfigPermutor.permuteGivensMap(givensMap);

    return {
      ...config,
      given: givensMap.map(row => row.join('')),
    };
  }

  static permuteGivensMap(givensMap) {
    givensMap = PuzzleConfigPermutor.shuffleBoxRows(givensMap);
    givensMap = PuzzleConfigPermutor.shuffleBoxColumns(givensMap);
    givensMap = PuzzleConfigPermutor.shuffleRowsWithinBoxGroups(givensMap);
    givensMap = PuzzleConfigPermutor.shuffleColumnsWithinBoxGroups(givensMap);
    givensMap = PuzzleConfigPermutor.rotate(givensMap);
    givensMap = PuzzleConfigPermutor.mirror(givensMap);
    givensMap = PuzzleConfigPermutor.substituteDigits(givensMap);
    return givensMap;
  }

  static shuffleBoxRows(givensMap) {
    // Shuffle each row of 3x3 boxes.

    const rowOrder = [0, 1, 2];
    arrShuffleInPlace(rowOrder);

    const newGivensMap = array(givensMap.length, givensMap[0].length);
    for (let newBoxRowIndex = 0; newBoxRowIndex < 3; newBoxRowIndex++) {
      const oldBoxRowIndex = rowOrder[newBoxRowIndex];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 9; col++) {
          newGivensMap[newBoxRowIndex * 3 + row][col] = givensMap[oldBoxRowIndex * 3 + row][col];
        }
      }
    }

    return newGivensMap;
  }

  static shuffleBoxColumns(givensMap) {
    // Shuffle each column of 3x3 boxes.

    const columnOrder = [0, 1, 2];
    arrShuffleInPlace(columnOrder);

    const newGivensMap = array(givensMap.length, givensMap[0].length);
    for (let newBoxColumnIndex = 0; newBoxColumnIndex < 3; newBoxColumnIndex++) {
      const oldBoxColumnIndex = columnOrder[newBoxColumnIndex];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 3; col++) {
          newGivensMap[row][newBoxColumnIndex * 3 + col] = givensMap[row][oldBoxColumnIndex * 3 + col];
        }
      }
    }

    return newGivensMap;
  }

  /**
   * Shuffles rows 1-3, shuffles rows 4-6, and shuffles rows 7-9 within their respective 3-row groups.
   * @param {(number | ' ')[][]} givensMap The current Sudoku puzzle configuration.
   */
  static shuffleRowsWithinBoxGroups(givensMap) {
    const newGivensMap = array(givensMap.length, givensMap[0].length);

    for (let boxGroup = 0; boxGroup < 3; boxGroup++) {
      const rowOrder = [0, 1, 2];
      arrShuffleInPlace(rowOrder);
      for (let newRow = 0; newRow < 3; newRow++) {
        const oldRow = rowOrder[newRow];
        for (let col = 0; col < 9; col++) {
          newGivensMap[boxGroup * 3 + newRow][col] = givensMap[boxGroup * 3 + oldRow][col];
        }
      }
    }

    return newGivensMap;
  }

  /**
   * Shuffles columns 1-3, shuffles columns 4-6, and shuffles columns 7-9 within their respective 3-column groups.
   * @param {(number | ' ')[][]} givensMap The current Sudoku puzzle configuration.
   */
  static shuffleColumnsWithinBoxGroups(givensMap) {
    const newGivensMap = array(givensMap.length, givensMap[0].length);

    for (let boxGroup = 0; boxGroup < 3; boxGroup++) {
      const columnOrder = [0, 1, 2];
      arrShuffleInPlace(columnOrder);
      for (let newCol = 0; newCol < 3; newCol++) {
        const oldCol = columnOrder[newCol];
        for (let row = 0; row < 9; row++) {
          newGivensMap[row][boxGroup * 3 + newCol] = givensMap[row][boxGroup * 3 + oldCol];
        }
      }
    }

    return newGivensMap;
  }

  static rotate(givensMap) {
    let result = givensMap;

    const rotations = randInt(0, 3);
    for (let i = 0; i < rotations; i++) {
      result = PuzzleConfigPermutor.#rotate90(result);
    }

    return result;
  }

  static #rotate90(givensMap) {
    // Rotate the puzzle 90 degrees clockwise.
    const newGivensMap = array(givensMap.length, givensMap[0].length);

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        newGivensMap[x][8 - y] = givensMap[y][x];
      }
    }

    return newGivensMap;
  }

  static mirror(givensMap) {
    // Mirror the puzzle vertically, maybe.
    if (randBool(0.5)) return givensMap;

    const newGivensMap = array(givensMap.length, givensMap[0].length);
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        newGivensMap[y][x] = givensMap[8 - y][x];
      }
    }

    return newGivensMap;
  }

  static substituteDigits(givensMap) {
    // Substitute digits 1-9 with a random permutation.
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    arrShuffleInPlace(digits);
    const newGivensMap = array(givensMap.length, givensMap[0].length);
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const oldVal = givensMap[y][x];
        let newVal;
        if (oldVal === ' ') {
          newVal = ' ';
        } else {
          newVal = digits[oldVal - 1];
        }
        newGivensMap[y][x] = newVal;
      }
    }
    return newGivensMap;
  }
}