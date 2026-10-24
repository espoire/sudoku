/**
 * Trims trailing null values from each row of a 2D array, resultant empty subarrays, trailing nulls from the top-level array, and the empty top-level array --> null too, if empty in the end.
 * @param {*[][]} array
 * @returns {*[][]|null} The trimmed 2D array, or null if the array is empty after trimming.
 */
export function trim2dArray(array) {
  const trimmedRows = array.map(row => {
    let lastNonNullIndex = row.length - 1;
    while (lastNonNullIndex >= 0 && row[lastNonNullIndex] == null) {
      lastNonNullIndex--;
    }
    return row.slice(0, lastNonNullIndex + 1);
  });

  // Remove empty subarrays.
  const nonEmptyRows = trimmedRows.map(row => row.length ? row : null);

  // Drop nulls from the end of the top-level array.
  let lastNonNullRowIndex = nonEmptyRows.length - 1;
  while (lastNonNullRowIndex >= 0 && nonEmptyRows[lastNonNullRowIndex] == null) {
    lastNonNullRowIndex--;
  }
  const trimmedArray = nonEmptyRows.slice(0, lastNonNullRowIndex + 1);

  // Return null if the top-level array is empty after trimming.
  return trimmedArray.length ? trimmedArray : null;
}

/**
 * Trims an object by removing properties with nullish values.
 * @param {*|null} obj The object to trim.
 */
export function trimObject(obj) {
  if (!obj) return;
  for (const key in obj) if (obj[key] == null) delete obj[key];
}