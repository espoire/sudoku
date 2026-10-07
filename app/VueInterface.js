import { reactive } from 'vue';

/** Exposes a collection of proxies for sending data into the Vue context for rendering to the 2D UI */
const ThreeVueInterface = {
  props: {
    mode: 'title',

    /** Programmatically copied from Settings.user; only need to intialize these keys to avoid crash-on-load due to access before programmatic initialization. */
    userSettings: {
      sound: { effects: true },
    },
  },
};

ThreeVueInterface.props = reactive(ThreeVueInterface.props);
window.ThreeVueInterface = ThreeVueInterface;
export default ThreeVueInterface;