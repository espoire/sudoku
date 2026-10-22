<script setup>
import { inject } from 'vue';
import MainMenu from './cmp/menu/MainMenu.vue';
import SettingsScreen from './cmp/settings/SettingsScreen.vue';
import Constants from '../Constants.js';
import PuzzlePlayerUi from './cmp/play/PuzzlePlayerUi.vue';
import PuzzleDirectory from './cmp/directory/PuzzleDirectory.vue';
import PuzzleEditorUi from './cmp/edit/PuzzleEditorUi.vue';
import DifficultySelect from './cmp/directory/DifficultySelect.vue';

const modes = Constants.modes;

// Receive as app.provide() / inject() so we can more easily expose to GlobalVueProps
const props = inject('props');
</script>

<template>
  <div class="vueAppWrap" :class="{ 'theme-dark': props.userSettings.darkMode }">
    <div class="mainColumn">
      <SettingsScreen v-if="props.mode === modes.settings" :settings="props.userSettings" />
      <MainMenu v-if="props.mode === modes.menu" />
      <DifficultySelect v-if="props.mode === modes.difficultySelect" :directory="props.directory" />
      <PuzzleDirectory v-if="props.mode === modes.directory" :puzzles="props.puzzles" />
      <PuzzleEditorUi v-if="props.mode === modes.edit"
          :settings="props.userSettings" :mode="props.mode"
          :board="props.board" />
      <PuzzlePlayerUi v-if="props.mode === modes.play"
          :settings="props.userSettings" :mode="props.mode"
          :puzzleId="props.puzzleId"
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
  --color-givens: #07063C;
  --color-gridlines: rgb(54, 18, 44);
  --color-cells: #E6D2C5;
  --color-text-mode-selector: rgb(160, 144, 156);
  --color-text-mode-selector-active: rgb(230, 210, 197);

  --user-color-c1: #C835FF;
  --user-color-c2: #FBA521;
  --user-color-c3: #01D6A6;
  --user-color-c4: #3BC905;
  --user-color-c5: #A881FF;
  --user-color-c6: #FF1378;
  --user-color-c7: #FE0808;
  --user-color-c8: #E26412;
  --user-color-c9: #3185FF;
  --user-color-b1: #E3A50C;
  --user-color-b2: #009D7C;
  --user-color-b3: #7A0C83;
  --user-color-b4: #205517;
  --user-color-b5: #FF729F;
  --user-color-b6: #4722AC;
  --user-color-b7: #E34C0B;
  --user-color-b8: #4F64EF; /* Was unlabelled in the colors spreadsheet, since only Light-Colorblind-8 was missing, I guessed it went here. */
  --user-color-b9: #608E45;
  --user-color-theme: var(--color-cells);

  --user-note-pen-blue: #134673;
  --user-note-pen-red: #B00C2A;
  --user-note-pen-blue-b: #137173;
  --user-note-pen-red-b: #B00C46;

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

    --user-color-c1: #E3A50C;
    --user-color-c2: #CB0C51;
    --user-color-c3: #248B74;
    --user-color-c4: #325D22;
    --user-color-c5: #9370E4;
    --user-color-c6: #850C36;
    --user-color-c7: #ED5050;
    --user-color-c8: #97430C;
    --user-color-c9: #66008C;
    --user-color-b1: #E3A50C;
    --user-color-b2: #009D7C;
    --user-color-b3: #7A0C83;
    --user-color-b4: #205517;
    --user-color-b5: #FF729F;
    --user-color-b6: #4722AC;
    --user-color-b7: #E34C0B;
    --user-color-b8: #4F64EF; /* Was ALSO unlabelled in the colors spreadsheet, since only Dark-Colorblind-8 was missing, I guessed it went here. */
    --user-color-b9: #608E45;
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
