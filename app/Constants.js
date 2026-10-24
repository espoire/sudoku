import { deepFreeze } from './util/Util.js';
import enumeration from './util/enum.js';

/** Game configuration contants. */
const Constants = {
  /** @readonly @enum {string} */
  modes: enumeration({
    menu: 'menu',
    settings: 'settings',
    play: 'play',
    difficultySelect: 'difficulty-select',
    directory: 'directory',
    edit: 'edit',
  }),

  /** @readonly @enum {string} */
  inputModes: {
    digit: 'digit',
    cornerNote: 'corner-note',
    centerNote: 'center-note',
    cellColor: 'cell-color',
  },

  /** @readonly @enum {string} */
  palettes: enumeration({
    regular: 'regular',
    colorBlind: 'color-blind',
  }),

  difficulty: enumeration({
    basic: 1,
    easy: 2,
    medium: 3,
    hard: 4,
    challenge: 5,
    expert: 6,
  }),
};

deepFreeze(Constants);
export default Constants;

window.expose('Constants', Constants); // Expose for debugging in dev tools