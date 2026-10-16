/** @typedef {{ given: string[] }} PuzzleConfig */

import Board from "./board/Board.js";

/**
 * Handles serializing and deserializing puzzle share data, as used
 * in direct puzzle "URL" share links. We're going to implement a few
 * formats first, then benchmark the actual resultant link lengths,
 * both raw and applying a few different compressions. Then based on
 * that data, we'll come back here and prune to only one chosen format.
 */
export default class PuzzleShareEncoder {
  /**
   * Encodes the given puzzle configuration into the raw string format.
   * 
   *
   * @param {PuzzleConfig} puzzleConfig
   * @returns {string}
   */
  static encodeRaw(puzzleConfig) {
    const givens = new Board(puzzleConfig).toRaw();
    const longNumber = givens.flat().map(v => v ?? '0').join('');
    const omitLeadingZeroes = longNumber.replace(/^0+/, '');
    return omitLeadingZeroes;
  }

  /**
   * Decodes the given raw string format back into a puzzle configuration.
   * 
   * Tolerant; will adjust for some imprecision in the format:
   * - Replaces missing leading zeroes with '0' to ensure a full 81-character string.
   * - Ignores any extra characters beyond the 81st character.
   * - All characters besides 1-9 are treated as '0'.
   * 
   * @param {string} rawString
   * @returns {PuzzleConfig}
   */
  static decodeRaw(rawString) {
    if (rawString.length > 81) rawString = rawString.slice(0, 81);
    rawString = rawString.replace(/[^1-9]/g, '0');
    if (rawString.length < 81) rawString = rawString.padStart(81, '0');

    const rows = [];
    for (let y = 0; y < 9; y++) {
      const row = [];
      for (let x = 0; x < 9; x++) {
        const char = rawString[y * 9 + x];
        row.push(char === '0' ? ' ' : char);
      }
      rows.push(row.join(''));
    }
    return { given: rows };
  }

  static encodeRunLength(puzzleConfig) {
    const givens = new Board(puzzleConfig).toRaw();
    const flatGivens = givens.flat().map(v => v ?? '0');

    // Alternate listing the number of consecutive "zeroes" in a row, and then the literal next digit.
    // Comma-delimited.
    // Omit the final count if it ends with zeroes.

    const delimiter = ',';

    let result = [];
    let position = 0;
    while (position < flatGivens.length) {
      // Enter a zero-run count
      const zeroCount = _countZeroes(flatGivens, position);
      position += zeroCount;

      if (position >= flatGivens.length) break;
      result.push(zeroCount);

      // Enter the literal next digit
      result.push(flatGivens[position]);
      position++;
    }

    return result.join(delimiter);
  }

  static decodeRunLength(runLengthString) {
    const delimiter = ',';
    const tokens = runLengthString.split(delimiter);
    const flatGivens = [];

    // Alternate...
    let mode = 'zero-run';
    for(const token of tokens) {

      // Inserting a run of zeroes, and...
      if (mode === 'zero-run') {
        const zeroCount = +token;
        for (let z = 0; z < zeroCount; z++) {
          flatGivens.push('0');
        }
        mode = 'literal';

      // Inserting a literal digit after a run of zeroes
      } else if (mode === 'literal') {
        flatGivens.push(token);
        mode = 'zero-run';
      }
    }

    // Pad to 81 (since Raw allows omitting *leading* zeroes, but this encoder optionally omits *trailing* zeroes)
    while (flatGivens.length < 81) flatGivens.push('0');
    // And punt to the raw decoder
    return PuzzleShareEncoder.decodeRaw(flatGivens.join(''));
  }

  static encodeRunLengthUndelimited(puzzleConfig) {
    const givens = new Board(puzzleConfig).toRaw();
    const flatGivens = givens.flat().map(v => v ?? '0');

    // Alternate listing the number of consecutive "zeroes" in a row, and then the literal next digit.
    // No delimiters; a span of zeroes exceeding length-9 will be represented by multiple digits.
    // Example: "000000000000005" (14 zeroes) would be encoded as "9045" (9 zeroes, a literal '0', 4 zeroes, a literal '5')
    // Example: "00000000007" (10 zeroes) would be encoded as "9007" (9 zeroes, a literal '0', 0 zeroes, a literal '7')
    // Omit the final count if it ends with zeroes (including multiple digits representing zeroes)

    let result = [];
    let position = 0;
    while (position < flatGivens.length) {
      // Enter a zero-run count
      let zeroCount = _countZeroes(flatGivens, position);
      position += zeroCount;

      if (position >= flatGivens.length) break;
      result.push(_encondeUndelimitedZeroRun(zeroCount));

      // Enter the literal next digit
      result.push(flatGivens[position]);
      position++;
    }

    return result.join('');
  }

  static decodeRunLengthUndelimited(undelimitedRunLengthString) {
    // Decode an undelimited run-length encoded string.
    // Format: alternating digit characters representing zero-run lengths and literal digits.

    const flatGivens = [];
    let index = 0;

    let mode = 'zero-run';
    while (index < undelimitedRunLengthString.length) {
      const char = undelimitedRunLengthString[index];

      if (mode === 'zero-run') {
        const zeroCount = +char;
        for (let z = 0; z < zeroCount; z++) {
          flatGivens.push('0');
        }
        mode = 'literal';

      } else if (mode === 'literal') {
        flatGivens.push(char);
        mode = 'zero-run';
      }

      index++;
    }

    // Pad to 81 (since Raw allows omitting *leading* zeroes, but this encoder optionally omits *trailing* zeroes)
    while (flatGivens.length < 81) flatGivens.push('0');
    // And punt to the raw decoder
    return PuzzleShareEncoder.decodeRaw(flatGivens.join(''));
  }

  static base65Encode(payload) {
    return base65Encode(payload, urlSafeCharset);
  }

  static base65Decode(base65String) {
    return base65Decode(base65String, urlSafeCharset);
  }
}

window.expose('PuzzleShareEncoder', PuzzleShareEncoder);

function _countZeroes(arr, start) {
  let count = 0;
  while (start + count < arr.length && arr[start + count] === '0') count++;
  return count;
}

/**
 * Encode a zero-run of a given length for the undelimited run-length encoding.
 * @param {number} length
 * @returns {string}
 */
function _encondeUndelimitedZeroRun(length) {
  let result = '';
  while (length >= 10) {
    result += '90';
    length -= 10;
  }
  result += length.toString();
  return result;
}

const urlSafeCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~';
function base65Encode(payload, outputCharset) {
  const result = [];

  if (['0', '1'].includes(payload[0])) {
    // If starts with 0, prepend a '1' to avoid losing leading zeroes.
    // If starts with 1, prepend a '1' to avoid losing the leading '1' when the decode step removes a presumed-prepended '1'.
    payload = '1' + payload.replaceAll(/[^1-9]/g, '0');
  }

  const inputBase = 10; // Assume restricted charset: only digits 0-9 are used for input.
  const outputBase = outputCharset.length;

  // Convert to a BigInt
  let value = BigInt(0);
  for (let i = 0; i < payload.length; i++) {
    value = value * BigInt(inputBase) + BigInt(+payload[i]);
  }

  // Convert from BigInt to the output base
  while (value > 0) {
    const remainder = value % BigInt(outputBase);
    result.push(outputCharset[Number(remainder)]);
    value = value / BigInt(outputBase);
  }

  return result.reverse().join('');
}

function base65Decode(base65String, inputCharset) {
  const inputBase = inputCharset.length;
  const outputBase = 10; // We are decoding back to the original decimal digits.
  
  // Rebuild the numeric value from the base65 string.
  let value = BigInt(0);
  for (let i = 0; i < base65String.length; i++) {
    value = value * BigInt(inputBase) + BigInt(inputCharset.indexOf(base65String[i]));
  }

  // Convert back to a regular base10 string.
  let text = value.toString(outputBase);

  // Remove the leading '1' that was added during encoding, if present
  if (text[0] === '1') { text = text.slice(1); }

  return text;
}