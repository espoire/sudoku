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

  difficulty: {
    basic1: 1,
    easy2: 2,
    medium3: 3,
    hard4: 4,
    challenge5: 5,
    expert6: 6,
  },

  difficultyNames: enumeration({
    1: 'Basic',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Challenge',
    6: 'Expert',
  }),

  difficultyIds: {
    1: 'basic1',
    2: 'easy2',
    3: 'medium3',
    4: 'hard4',
    5: 'challenge5',
    6: 'expert6',
  },
};

deepFreeze(Constants);
export default Constants;

window.expose('Constants', Constants); // Expose for debugging in dev tools