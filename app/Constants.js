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
};

deepFreeze(Constants);
export default Constants;

window.expose('Constants', Constants); // Expose for debugging in dev tools