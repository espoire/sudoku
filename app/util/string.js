import { head, tail } from './Array.js';

export const symbols = {
  cross: '×',
  interrobang: '⁉',
  arrow: '→',
};

export function stripSpecialCharacters(text) {
  return text.replace(/[^a-zA-Z0-9 ]/g, '');
}

export function toSnakeCase(text) {
  return text
    .split(' ')
    .map(word => word.toLowerCase())
    .join('-');
}

export function snakeCaseToTitleCase(text) {
  return _toTitleCase(text.split('-'));
}

/** (?=...) is a lookahead assertion; it matches the position before the provided pattern.
 * Thus, this regex matches the position before any uppercase letter.
 *
 * It doesn’t match any characters directly.
 * It only identifies positions just before uppercase letters.
 *
 * @type {RegExp}
 */
const positionsBeforeUppercase = /(?=[A-Z])/;

/** Converts the provided text from PascalCase to snake-case.
 *
 * @param {string} text
 * @returns {string}
 */
export function pascalCaseToSnakeCase(text) {
  return text
    .split(positionsBeforeUppercase)
    .map(word => word.toLowerCase())
    .join('-');
}

/**
 * Converts the provided text from Title Case to snake-case.
 *
 * Examples:
 * - 'The Tower' --> 'the-tower'
 * - 'Vlad the Impaler' --> 'vlad-the-impaler'
 * - 'I Wrote Some HTML... or Did I?' --> 'i-wrote-some-html-or-did-i'
 * - 'sArCaSm CaSe' --> 'sarcasm-case'
 *
 * Examples where you should consider a different function:
 * - 'PascalCase' --> 'pascalcase'
 * - 'camelCase' --> 'camelcase'
 *
 * @param {string} text
 * @returns {string} The text converted from Title Case to snake-case.
 */
export function titleCaseToSnakeCase(text) {
  if (typeof text !== 'string') return text;

  // Only need to include characters reasonably expected in user-facing text, so the lack of e.g. emojis, brackets, backticks, etc. is fine.
  const punctuationRegex = /[.,'"!?;:()~%&+\\/]/g;

  return text
    .replace(punctuationRegex, '') // Remove punctuation
    .split(' ')
    .map(word => word.toLowerCase())
    .join('-');
}

/** @param {string} s */
export function capitalize(s) {
  if (s == null) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const titleCaseExcludedWords = ['to', 'the', 'of', 'a', 'an', 'and', 'or', 'in', 'as'];
/** Converts the provided text to Title Case.
 *
 * Examples:
 * - 'the tower' --> 'The Tower'
 * - 'vlad the impaler' --> 'Vlad the Impaler'
 * - 'I wrote some HTML... or did I?' --> 'I Wrote Some HTML... or Did I?'
 *
 * Examples where you should consider a different function:
 * - 'sArCaSm CaSe' --> 'SArCaSm CaSe'
 * - 'maximum hp' --> 'Maximum Hp'
 * - 'camelCase' --> 'CamelCase'
 *
 * @param {string} text
 * @returns {string}
 */
export function toTitleCase(text) {
  if (typeof text !== 'string') return text;
  const words = text.split(' ');
  return _toTitleCase(words);
}

function _toTitleCase(words) {
  for (let i = 0; i < words.length; i++) {
    if (i > 0 && titleCaseExcludedWords.includes(words[i].toLowerCase())) continue;
    words[i] = capitalize(words[i]);
  }

  return words.join(' ');
}

/**
 * @param {*} a
 * @param {*} b
 * @returns {boolean} True if a and b are both strings and are equal, ignoring case, OR a and b are both nullish.
 */
export function stringsEqualIgnoreCase(a, b) {
  if (a == null && b == null) return true;
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * @param {string[]} items
 * @param {string} conjunction Usually 'and' or 'or'.
 * @returns {string}
 */
export function conjunct(conjunction, items) {
  if (!Array.isArray(items)) return items;
  const lastTwo = tail(2, items);
  const rest = head(-2, items);
  return [...rest, lastTwo.join(` ${conjunction} `)].join(', ');
}

export function plural(number, suffixIfPlural = 's', suffixIfSingular = '') {
  return number === 1 ? suffixIfSingular : suffixIfPlural;
}
