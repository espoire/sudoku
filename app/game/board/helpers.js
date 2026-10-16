export function create2DArray(rows, columns, generatorFnOrValue) {
  let generatorFn = generatorFnOrValue;
  if (typeof generatorFnOrValue !== 'function') generatorFn = () => generatorFnOrValue;

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => generatorFn(row, column))
  );
}