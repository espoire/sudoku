<script setup>
import { inject } from 'vue';
import TitleScreen from './cmp/title/TitleScreen.vue';
import SettingsScreen from './cmp/settings/SettingsScreen.vue';
import Constants from '../Constants.js';
import SudokuUi from './cmp/board/SudokuUi.vue';

const modes = Constants.modes;

// Receive as app.provide() / inject() so we can more easily expose to GlobalVueProps
const props = inject('props');
</script>

<template>
  <div class="vueAppWrap" :class="{ 'theme-dark': props.userSettings.darkMode }">
    <div class="mainColumn">
      <SettingsScreen v-if="props.mode === modes.settings" :settings="props.userSettings" />
      <TitleScreen v-if="props.mode === modes.title" :userSettings="props.userSettings" />
      <SudokuUi v-if="props.mode === modes.play"
          :settings="props.userSettings" :mode="props.mode"
          :board="props.board"
          :timer="props.timer"
          :inputMode="props.inputMode"
          :palette="props.palette" />
    </div>
  </div>
</template>

<style scoped>
.vueAppWrap {
  width: 100%;
  height: 100%;

  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;

  color: var(--color-text);
  background-color: rgb(54, 18, 44);
  transition:
    background-color 0.5s;

  --color-background: var(--vt-c-white);
  --color-background-soft: var(--vt-c-white-soft);
  --color-background-mute: var(--vt-c-white-mute);

  --color-border: var(--vt-c-divider-light-2);
  --color-border-hover: var(--vt-c-divider-light-1);

  --color-heading: var(--vt-c-text-light-1);
  --color-header: var(--color-heading); /* alias, catch typos for better DevX */
  --color-text: var(--vt-c-text-light-2);
  --color-text-inverted: var(--vt-c-text-dark-2);
  --color-heading-inverted: var(--vt-c-text-dark-1);

  --color-pencil: var(--color-text);
  --color-givens: rgb(54, 18, 44);
  --color-gridlines: rgb(54, 18, 44);
  --color-cells: rgb(230, 210, 197);
  --color-text-mode-selector: rgb(160, 144, 156);
  --color-text-mode-selector-active: rgb(230, 210, 197);

  --user-color-c1: rgb(230, 210, 197);
  --user-color-c2: rgb(160, 144, 156);
  --user-color-c3: rgb(54, 18, 44);
  --user-color-c4: rgb(200, 180, 160);
  --user-color-c5: rgb(140, 120, 100);
  --user-color-c6: rgb(100, 80, 60);
  --user-color-c7: rgb(80, 60, 40);
  --user-color-c8: rgb(60, 40, 20);
  --user-color-c9: rgb(40, 20, 10);
  --user-color-b1: red;
  --user-color-b2: orange;
  --user-color-b3: yellow;
  --user-color-b4: green;
  --user-color-b5: blue;
  --user-color-b6: indigo;
  --user-color-b7: violet;
  --user-color-b8: pink;
  --user-color-b9: white;
  --user-color-theme: var(--color-cells);

  --color-warning: #fa0;
  --color-warning-text: #b50;
  --color-error: #faa;
  --color-error-text: #b00;

  --color-mask: color-mix(in srgb, var(--color-background) 75%, transparent);
  --background-mask: radial-gradient(var(--color-mask), var(--color-background));

  /* Conventions:
  - all back buttons will be bound to Escape / mobile OS back gesture
  - all aside buttons will be bound to Space
  - all advance buttons will be bound to Enter
  - destructive buttons will NOT be bound */

  --color-button-destructive: #800;
  --color-button-back: #555;
  --color-button-aside: #09c;
  --color-button-advance: #0a0;

  &.theme-dark {
    --color-background: var(--vt-c-black);
    --color-background-soft: var(--vt-c-black-soft);
    --color-background-mute: var(--vt-c-black-mute);

    --color-border: var(--vt-c-divider-dark-2);
    --color-border-hover: var(--vt-c-divider-dark-1);

    --color-heading: var(--vt-c-text-dark-1);
    --color-header: var(--color-heading); /* alias, catch typos for better DevX */
    --color-text: var(--vt-c-text-dark-2);
    --color-text-inverted: var(--vt-c-text-light-2);
    --color-heading-inverted: var(--vt-c-text-light-1);

    --color-pencil: var(--color-text);
    --color-givens: rgb(230 210 197);
    --color-gridlines: rgb(160, 144, 156);
    --color-cells: rgb(54, 18, 44);

    --user-color-c1: rgb(67, 18, 44);
    --user-color-c2: rgb(160, 144, 156);
    --user-color-c3: rgb(54, 18, 44);
    --user-color-c4: rgb(200, 180, 160);
    --user-color-c5: rgb(140, 120, 100);
    --user-color-c6: rgb(100, 80, 60);
    --user-color-c7: rgb(80, 60, 40);
    --user-color-c8: rgb(60, 40, 20);
    --user-color-c9: rgb(40, 20, 10);
    --user-color-b1: red;
    --user-color-b2: orange;
    --user-color-b3: yellow;
    --user-color-b4: green;
    --user-color-b5: blue;
    --user-color-b6: indigo;
    --user-color-b7: violet;
    --user-color-b8: pink;
    --user-color-b9: white;
    --user-color-theme: var(--color-cells);

    --color-warning: #b50;
    --color-warning-text: #fa0;
    --color-error: #500;
    --color-error-text: #f77;
  }
}

.mainColumn {
  position: relative;
  height: 100dvh;
  width: 100dvw;
  max-width: min(60dvh, 100dvw);
  left: calc(50dvw - min(30dvh, 50dvw));
  background-color: rgb(54, 18, 44);
}
</style>
