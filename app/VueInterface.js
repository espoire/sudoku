import { reactive } from 'vue';
import Constants from './Constants.js';

/** Exposes a collection of proxies for sending data into the Vue context for rendering to the 2D UI */
const GlobalVueProps = reactive({
  mode: 'title',

  /** @type {string?} */
  puzzleId: null,

  board: {
    size: { x: 0, y :0 },
    /** @type {Array<Array<{ value: number, given: boolean, error: boolean }>>} */
    contents: [],
  },

  timer: {
    startTime: 0,
    totalPausesLength: 0,
    paused: false,
    elapsedTimeAtPause: 0,
  },

  /** @type {'digit' | 'corner-note' | 'center-note' | 'cell-color'} The current input mode for the UI. */
  inputMode: Constants.inputModes.digit,

  /** @type {'regular' | 'color-blind'} The current palette for cell colors. */
  palette: Constants.palettes.regular,

  /** Programmatically copied from Settings.user; only need to intialize these keys to avoid crash-on-load due to access before programmatic initialization. */
  userSettings: {},

  /** @type {Array<{ id: string, title: string }>} The list of available puzzles. */
  puzzles: [],
});

window.GlobalVueProps = GlobalVueProps;
export default GlobalVueProps;