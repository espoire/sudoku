import './vue/style/main.scss';
import { createApp } from 'vue';
import App from './vue/App.vue';
import ThreeVueInterface from './VueInterface';
import { plugin as VueTippy } from 'vue-tippy';
import 'tippy.js/dist/tippy.css';

const props = ThreeVueInterface.props;

const app = createApp(App);
app.use(VueTippy);
app.provide('props', props); // Connect the ThreeVueInterface to the root Vue component
app.mount('#vueApp'); // Mount the Vue app to the #vueApp DOM element, see index.html