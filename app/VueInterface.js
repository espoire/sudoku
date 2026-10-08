import { reactive } from 'vue';

/** Exposes a collection of proxies for sending data into the Vue context for rendering to the 2D UI */
const GlobalVueProps = reactive({
  mode: 'title',

  board: {
    size: { x: 0, y :0 },
    /** @type {Array<Array<{ value: number, given: boolean }>>} */
    contents: [],
  },

  /** Programmatically copied from Settings.user; only need to intialize these keys to avoid crash-on-load due to access before programmatic initialization. */
  userSettings: {},
});

window.GlobalVueProps = GlobalVueProps;
export default GlobalVueProps;