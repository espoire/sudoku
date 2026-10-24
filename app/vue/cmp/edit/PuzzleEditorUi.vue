<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import Constants from '/app/Constants.js';
import Globals from '/app/Globals.js';
import GameController from '/app/game/GameController.js';
import { toSnakeCase, toTitleCase } from '/app/util/string';
import { range } from '/app/util/Array';
import BoardSelector from '../play/BoardSelector.vue';
import ModalManager from '../../ModalManager.js';
import { logUiEvent } from '../play/helpers.js';
import VisualNumpad from '../play/VisualNumpad.vue';
import HeaderBar from '../play/HeaderBar.vue';
import RandomTitles from './RandomTitles.js';

const props = defineProps({
  settings: Object,
  mode: String,

  board: {
    size: {
      x: Number,
      y: Number
    },
    contents: {
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean, notes: { corner: { value: number, valid: boolean }[], center: { value: number, valid: boolean }[] }, colors: string[] }
    },
    active: {
      type: Object, // { row: number, column: number } representing the active cell, or null if no cell is active.
      default: null
    },
  },
});

function returnToMainMenu() {
  logUiEvent('returnToMainMenu');
  GameController.showMainMenu();
}

function openSettingsMenu() {
  logUiEvent('onClickSettingsButton');
  GameController.onSettingsClicked();
}
const defaultTitle = ref(RandomTitles.getTitle());
const defaultId = ref(RandomTitles.getId());

const title = ref('');
const id = ref('');
const notes = ref('');
const difficulty = ref('');

const placeholderId = computed(() => title.value ? toSnakeCase(title.value) : defaultId.value);

function onBlurTitle() { title.value = toTitleCase(title.value); }
function onBlurId() { id.value = toSnakeCase(id.value); }

const numerals = range(0, 9).map(n => `${n}`);
const clearDigits = [' ', '-', 'Delete', 'Backspace'];
onMounted(() => {
  ModalManager.registerPeer('BoardSelector.vue', 'PuzzleEditorUi.vue', { onKeydown });
});
onUnmounted(() => {
  ModalManager.unregister('PuzzleEditorUi.vue');
});

function onKeydown(event) {
  logUiEvent('onKeydown', event);
  if (isAnyInputFocused.value) return;
  
  if (numerals.includes(event.key)) {
    onNumeralInput(+event.key);

  } else if (clearDigits.includes(event.key)) {
    onNumeralInput(null);
  }
}

function onNumeralInput(value) {
  logUiEvent('onNumeralInput', value);
  Globals.gameController.handleNumeralInput(value);
}

function copyPuzzle() {
  const givens = props.board.contents.map(row =>
    row.map(cell => cell.value ?? ' ').join('')
  );

  let puzzleCode = [];

  puzzleCode.push('{');
  puzzleCode.push(`  title: '${title.value || defaultTitle.value}',`);
  puzzleCode.push(`  id: '${id.value || placeholderId.value}',`);
  if (difficulty.value) {
    puzzleCode.push(`  difficulty: difficulty.${Constants.difficultyNames[difficulty.value]},`);
  }
  if (notes.value) {
    const quote = notes.value.includes("\n") ? `\`` : `'`; 
    puzzleCode.push(`  notes: ${quote}${notes.value}${quote},`);
  }
  if (props.board.size.x !== 9 || props.board.size.y !== 9) {
    puzzleCode.push(`  size: { x: ${props.board.size.x}, y: ${props.board.size.y} },`);
  }
  puzzleCode.push(`  given: [`);
  givens.forEach(row => {
    puzzleCode.push(`    '${row}',`);
  });
  puzzleCode.push(`  ],`);
  puzzleCode.push(`}`);

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(puzzleCode.join('\n'));
  } else {
    copy(puzzleCode.join('\n'));
  }
  console.log('Puzzle copied to clipboard', puzzleCode.join('\n'));

  rerollRandomTitle();
}

function rerollRandomTitle() {
  RandomTitles.pickNew();

  defaultTitle.value = RandomTitles.getTitle();
  defaultId.value = RandomTitles.getId();
}

const focusedInputs = ref(new Set());
const isAnyInputFocused = computed(() => focusedInputs.value.size > 0);

function onFocusInput(inputName) {
  focusedInputs.value.add(inputName);
}

function onBlurInput(inputName) {
  focusedInputs.value.delete(inputName);
}
</script>

<template>
  <div class="column-wrap">
    <HeaderBar :timer="null" @back="returnToMainMenu" @settings="openSettingsMenu" />
    <div class="row title">
      <label for="title">Title</label>
      <input type="text" id="title" class="title-text-input" :placeholder="defaultTitle" v-model="title" @focus="onFocusInput('title')" @blur="() => { onBlurTitle(); onBlurInput('title') }"/>
    </div>
    <div class="row id">
      <label for="id">ID</label>
      <input type="text" id="id" class="id-text-input" :placeholder="placeholderId" v-model="id" @focus="onFocusInput('id')" @blur="() => { onBlurId(); onBlurInput('id') }"/>
    </div>
    <div class="row notes">
      <label for="notes">Notes</label>
      <textarea id="notes" class="notes-text-area" v-model="notes" @focus="onFocusInput('notes')" @blur="() => { onBlurInput('notes') }"></textarea>
    </div>
    <div class="row difficulty">
      <label for="difficulty">Difficulty</label>
      <select id="difficulty" class="difficulty-select" v-model="difficulty" @focus="onFocusInput('difficulty')" @blur="() => { onBlurInput('difficulty') }">
        <option value=""></option>
        <option value="1">1 - Basic</option>
        <option value="2">2 - Easy</option>
        <option value="3">3 - Medium</option>
        <option value="4">4 - Hard</option>
        <option value="5">5 - Challenge</option>
        <option value="6">6 - Expert</option>
      </select>
    </div>
    
    <BoardSelector :settings="settings" :board="board" :mode="mode" :suppressKeyboard="isAnyInputFocused" />

    <div class="copy-finished">
      <div id="sudoku-puzzle-editor-copy-puzzle-button" class="copy-puzzle-button" @click="copyPuzzle">Copy as Code</div>
      <label for="sudoku-puzzle-editor-copy-puzzle-button">When finished editing your puzzle, click this button, then paste into Discord or similar to send the puzzle to me.</label>
    </div>

    <VisualNumpad @numeral="onNumeralInput" />
  </div>
</template>

<style lang="scss" scoped>
.column-wrap {
  width: 100rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;

  &.title { margin-bottom: 0.2rem; }
  &.id { margin-bottom: 0.5rem; }
  &.notes { margin-bottom: 0.5rem; }
  &.difficulty { margin-bottom: 1rem; }
}

label {
  font-size: 2rem;
  line-height: 1;
  color: var(--color-givens);
  color: #fffc;
  margin-right: 0.8rem;
}

.title-text-input, .id-text-input {
  padding: 0.5rem;
  border-radius: 0.3em;
  text-align: center;
  pointer-events: all;
}

.title-text-input {
  max-width: 80rem;
  font-size: 5rem;
}

.id-text-input {
  max-width: 60rem;
  font-size: 3rem;

  &:not(:focus) {
    opacity: 0.5;
  }
}

.notes-text-area {
  min-width: 80rem;
  min-height: 10rem;
  padding: 0.5rem;
  border-radius: 0.5em;
  font-size: 2rem;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  pointer-events: all;
}

.difficulty-select {
  width: 6rem;
  font-size: 2rem;
  padding: 0.5rem;
  pointer-events: all;
}

.copy-finished {
  width: 55%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.8rem;

  .copy-puzzle-button {
    width: fit-content;
    font-size: 3rem;
    margin-top: 1rem;
    padding: 0 0.4em 0.1em 0.4em;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 0.25em;
    cursor: pointer;
    pointer-events: all;
  }

  label {
    line-height: 1.2;
  }
}

.visual-numpad {
  margin-top: 3rem;
}
</style>