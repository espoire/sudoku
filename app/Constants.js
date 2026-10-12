import { deepFreeze } from './util/Util.js';
import enumeration from './util/enum.js';

/** Game configuration contants. */
const Constants = {
  /** @readonly @enum {string} */
  modes: enumeration({
    title: 'title',
    settings: 'settings',
    play: 'play',
  }),

  /** @readonly @enum {string} */
  inputModes: enumeration({
    digit: 'digit',
    cornerNote: 'corner-note',
    centerNote: 'center-note',
    cellColor: 'cell-color',
  }),

  /** @readonly @enum {string} */
  cellColorModes: enumeration({
    regular: 'regular',
    colorBlind: 'color-blind',
  }),
};

deepFreeze(Constants);
export default Constants;

window.expose('Constants', Constants); // Expose for debugging in dev tools