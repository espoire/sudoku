import { randomArrayElement } from '../../../util/random.js';

const titleMessages = [
  'Ooh, shiny!',
];

export function getEpithet() {
  return randomArrayElement(titleMessages);
}
