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
      <SudokuUi v-if="props.mode === modes.play" :settings="props.userSettings" :mode="props.mode" :board="props.board" :timer="props.timer" />
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

  --color-givens: var(--vt-c-black);
  --color-gridlines: var(--vt-c-black);
  --color-cells: var(--vt-c-white);

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

    --color-givens: var(--color-text);
    --color-gridlines: #313131;
    --color-cells: var(--color-background-soft);

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
