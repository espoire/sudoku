import Settings from '../app/Settings.js';
import { runPuzzleShareEncoderTests } from './game/PuzzleShareEncoder.test.js';
import { runArrayUtilityTests, visualInspectionTestRotateRectangularArray } from './util/ArrayTest.js';
import { testDeepEquals } from './util/ObjectTest.js';

export function runTests() {
  console.log('');
  console.log('Running all tests...');
  console.log('');

  // Suppress dev-test settings; they can mess with the expected outputs and/or spam up the console if logging is enabled
  const temp = Settings.test;
  Settings.test = {};

  runPuzzleShareEncoderTests();
  visualInspectionTestRotateRectangularArray(true);
  testDeepEquals();
  runArrayUtilityTests();

  // Restore dev-test settings after auto-tests are done
  Settings.test = temp;
}