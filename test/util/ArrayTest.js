import { memberwiseEquals, multisetEquals, prettyPrint2DRectArray, rotateRectangularArray } from "../../app/util/Array.js";
import { errorMaybe, runFunctionalTests } from "../TestHelpers.js";

export function visualInspectionTestRotateRectangularArray(silentOnSuccess = false) {
  const testCases = [{
    input: [[
      [4, 1],
      [5, 2],
      [6, 3]
    ], 'sunwise'],
    expected: [
      [6, 5, 4],
      [3, 2, 1],
    ]
  }, {
    input: [[
      [4, 1],
      [5, 2],
      [6, 3]
    ], 'widdershins'],
    expected: [
      [1, 2, 3],
      [4, 5, 6],
    ]
  }, {
    input: [[
      [4, 1],
      [5, 2],
      [6, 3]
    ], 'turnabout'],
    expected: [
      [3, 6],
      [2, 5],
      [1, 4]
    ]
  }]

  const logFn = silentOnSuccess ? console.error : console.log

  for (const test of testCases) {
    const result = rotateRectangularArray(...test.input);
    const success = memberwiseEquals(test.expected, result);

    if (success && silentOnSuccess) continue;

    logFn('\n');
    logFn('Testing rotateRectangularArray() with the following input arguments:');
    logFn('Input array:');
    prettyPrint2DRectArray(test.input[0]);
    logFn('Direction:', test.input[1]);
    
    logFn('\n');
    logFn('Expected output:');
    prettyPrint2DRectArray(test.expected);
    
    logFn('\n');
    logFn('Actual output:');
    prettyPrint2DRectArray(result);
    
    logFn('\n');
    logFn('Equal?:', success);
    logFn('\n');
  }
}

export function runArrayUtilityTests() {
  runFunctionalTests('Array utilities', [
    _testMultisetEquals,
  ]);
}

function _testMultisetEquals() {
  const testCases = [
    // --- Basic functionality ---
    {
      label: 'Same elements, different order',
      inputA: [1, 2, 3],
      inputB: [3, 2, 1],
      expected: true,
    },
    {
      label: 'Different elements',
      inputA: [1, 2, 3],
      inputB: [1, 2, 4],
      expected: false,
    },
    {
      label: 'Different lengths',
      inputA: [1, 2],
      inputB: [1, 2, 3],
      expected: false,
    },

    // --- Duplicates ---
    {
      label: 'Same duplicates',
      inputA: [1, 1, 2],
      inputB: [2, 1, 1],
      expected: true,
    },
    {
      label: 'Different duplicate counts',
      inputA: [1, 1, 2],
      inputB: [1, 2, 2],
      expected: false,
    },

    // --- Empty arrays ---
    {
      label: 'Both empty',
      inputA: [],
      inputB: [],
      expected: true,
    },
    {
      label: 'One empty, one not',
      inputA: [],
      inputB: [1],
      expected: false,
    },

    // --- Non-array inputs ---
    {
      label: 'First input not array',
      inputA: null,
      inputB: [],
      expected: false,
    },
    {
      label: 'Second input not array',
      inputA: [],
      inputB: {},
      expected: false,
    },

    // --- Primitive edge cases ---
    {
      label: 'Handles strings',
      inputA: ['a', 'b', 'a'],
      inputB: ['b', 'a', 'a'],
      expected: true,
    },
    {
      label: 'Handles booleans',
      inputA: [true, false, true],
      inputB: [false, true, true],
      expected: true,
    },

    // --- Special JS values ---
    {
      label: 'Handles NaN correctly',
      inputA: [NaN, NaN],
      inputB: [NaN, NaN],
      expected: true,
    },
    {
      label: 'NaN vs number',
      inputA: [NaN],
      inputB: [1],
      expected: false,
    },
    {
      label: '+0 and -0 treated equal (Map behavior)',
      inputA: [+0],
      inputB: [-0],
      expected: true,
    },
    {
      label: '0 and -0 mixed counts',
      inputA: [0, -0, 0],
      inputB: [-0, 0, -0],
      expected: true, // Map treats 0 and -0 as the same key
    },
    {
      label: 'NaN mixed with numbers',
      inputA: [NaN, 1],
      inputB: [NaN, 1],
      expected: true,
    },

    // --- Object references ---
    {
      label: 'Same object reference',
      ...(() => {
        const obj = { a: 1 };
        return { inputA: [obj], inputB: [obj] };
      })(),
      expected: true,
    },
    {
      label: 'Same object instance reused',
      ...(() => {
        const obj = { a: 1 };
        return { inputA: [obj, obj], inputB: [obj, obj] };
      })(),
      expected: true,
    },
    {
      label: 'Same object reference, different counts',
      ...(() => {
        const obj = { a: 1 };
        return { inputA: [obj], inputB: [obj, obj] };
      })(),
      expected: false,
    },
    {
      label: 'Some same object reference, some same content but different references',
      ...(() => {
        const obj = { a: 1 };
        return { inputA: [obj, { a: 1 }], inputB: [obj, obj] };
      })(),
      expected: false,
    },

    // --- Mixed types ---
    {
      label: 'Mixed primitives',
      inputA: [1, '1', true],
      inputB: ['1', true, 1],
      expected: true,
    },
    {
      label: 'Mixed primitives not equal',
      inputA: [1, '1'],
      inputB: [1, 1],
      expected: false,
    },

    // --- Undefined / null ---
    {
      label: 'undefined values',
      inputA: [undefined, undefined],
      inputB: [undefined, undefined],
      expected: true,
    },
    {
      label: 'null vs undefined',
      inputA: [null],
      inputB: [undefined],
      expected: false,
    },

    // --- Stress-ish ---
    {
      label: 'Large equal arrays',
      inputA: Array(100).fill(1),
      inputB: Array(100).fill(1),
      expected: true,
    },
    {
      label: 'Large unequal arrays',
      inputA: Array(100).fill(1),
      inputB: [...Array(99).fill(1), 2],
      expected: false,
    },

    // --- Real-world ---
    {
      label: 'Former version known failure case, from BoardState.getMatches() tests',
      inputA: ['0,0', '1,0', '2,0', '3,0', '0,1', '1,1', '2,1', '3,1', '0,2', '1,2', '2,2', '3,2', '0,3', '1,3', '2,3', '3,3'],
      inputB: ['0,0', '1,0', '2,0', '3,0', '0,1', '0,2', '1,1', '1,2', '2,2', '2,1', '3,2', '3,1', '0,3', '1,3', '2,3', '3,3'],
      expected: true,
    }
  ];

  const errors = [];

  for (const { label, inputA, inputB, expected } of testCases) {
    try {
      const actual = multisetEquals(inputA, inputB);
      if (actual !== expected) {
        errors.push(`Test "${label}" failed. Actual: ${actual}. Expected: ${expected}.`);
      }
    } catch (error) {
      errors.push(`Test "${label}" threw an error: ${error.message}`);
    }
  }

  errorMaybe('multisetEquals', errors);
  return { cases: testCases.length, errors };
}