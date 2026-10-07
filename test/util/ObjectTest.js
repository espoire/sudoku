import { deepEquals } from "../../app/util/object.js";

const testCases = [
  // Primitive values
  { a: 1, b: 1, expected: true },
  { a: 1, b: '1', expected: false },
  { a: null, b: null, expected: true },
  { a: undefined, b: undefined, expected: true },
  { a: null, b: undefined, expected: false },
  { a: true, b: true, expected: true },
  { a: false, b: false, expected: true },
  { a: true, b: false, expected: false },

  // Simple arrays
  { a: [1, 2, 3], b: [1, 2, 3], expected: true },
  { a: [1, 2], b: [1, 2, 3], expected: false },
  { a: [1, 2, 3], b: [1, 2, '3'], expected: false },

  // Nested arrays
  { a: [1, [2, 3]], b: [1, [2, 3]], expected: true },
  { a: [1, [2, 3]], b: [1, [3, 2]], expected: false },

  // Plain objects
  { a: { x: 1, y: 2 }, b: { x: 1, y: 2 }, expected: true },
  { a: { x: 1 }, b: { x: 1, y: 2 }, expected: false },
  { a: { y: 2, x: 1 }, b: { x: 1, y: 2 }, expected: true },
  { a: { x: 1, y: 2 }, b: { x: 1, y: '2' }, expected: false },

  // Nested objects
  { a: { a: { b: { c: 1 } } }, b: { a: { b: { c: 1 } } }, expected: true },
  { a: { a: { b: { c: 1 } } }, b: { a: { b: { c: 2 } } }, expected: false },

  // Mixed object and array
  { a: { arr: [1, 2], obj: { x: 5 } }, b: { arr: [1, 2], obj: { x: 5 } }, expected: true },
  { a: { arr: [1, 2], obj: { x: 5 } }, b: { arr: [1, 2], obj: { x: 6 } }, expected: false },

  // Edge case: array vs object
  { a: [], b: {}, expected: false },

  // Unsupported values: functions and symbols
  { a: { x: () => {} }, b: { x: () => {} }, expected: false },
  { a: { x: Symbol('a') }, b: { x: Symbol('a') }, expected: false },

  // Object with extra undefined properties
  { a: { x: undefined }, b: {}, expected: false },
  { a: {}, b: { x: undefined }, expected: false },

  // Same object reference
  (() => {
    const obj = { x: 1 };
    return { a: obj, b: obj, expected: true };
  })(),
];

// Test the deepEquals function
export function testDeepEquals() {
  const errors = [];

  for (const { a, b, expected } of testCases) {
    const result = deepEquals(a, b);
    if (result !== expected) {
      errors.push(`Failed for a: ${JSON.stringify(a)}, b: ${JSON.stringify(b)}. Expected ${expected}, got ${result}`);
    }
  }

  if (errors.length) {
    console.error('deepEquals test failed:', errors);
  }
}