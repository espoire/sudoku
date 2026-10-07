import Constants from '../app/Constants.js';

export function isValidElement(value) {
  return typeof value === 'string' && Constants.element.list.includes(value);
}

export function errorMaybe(prefix, errors) {
  if (!(errors.length > 0)) return;

  console.log('');
  console.error(`${prefix ?? ''}${prefix ? ' ' : ''}Tests failed:`);
  errors.forEach(err => typeof err === 'object' ? console.error(err) : console.error(` - ${err}`));
  console.log('');
}

export function warnMaybe(prefix, messages) {
  if (!(messages.length > 0)) return;

  console.log('');
  console.warn(`${prefix ?? ''}${prefix ? ' ' : ''}Tests warnings:`);
  messages.forEach(msg => console.warn(msg));
  console.log('');
}

/**
 * @param {string} expect
 * @param {string} actual
 * @returns {string} A summary of the differences between the two strings, with differences highlighted and matches shown as whitespace.
 */
export function stringDiff(expect, actual) {
  const longerLength = Math.max(expect.length, actual.length);
  const diffMessage = [];
  const newlineChars = ['\n', '\r'];

  for (let i = 0; i < longerLength; i++) {
    if (i >= expect.length) {
      diffMessage.push(actual[i]);
    } else if (i >= actual.length) {
      diffMessage.push('.');
    } else if (expect[i] !== actual[i]) {
      diffMessage.push(actual[i]);
    } else if (expect[i] === actual[i] && newlineChars.includes(expect[i])) {
      diffMessage.push(expect[i]);
    } else {
      diffMessage.push(' ');
    }
  }

  return diffMessage.join('');
}

/**
 * @param {string} label
 * @param {(() => (void | { cases?: number, errors?: string[] } | string[]))[]} testFns
 */
export function runFunctionalTests(label, testFns) {
  let errors = 0;
  let passes = 0;
  let cases = 0;

  for (const testFn of testFns) {
    const result = testFn();

    let newCases, newErrors;
    if (result == null) {
      newCases = 1;
      newErrors = [];
    } else if (Array.isArray(result)) {
      newCases = 1;
      newErrors = result;
    } else {
      newCases = result.cases ?? 1;
      newErrors = result.errors ?? [];
    }

    if (newErrors.length > 0) {
      errors += newErrors.length;
    } else {
      passes += newCases;
    }
    cases += newCases;
  }

  if (errors > 0) {
    console.error(`${passes} of ${cases} ${label} tests passed, ${errors} errors.`);
  } else {
    console.log(`${passes} of ${cases} ${label} tests passed!`);
  }
}