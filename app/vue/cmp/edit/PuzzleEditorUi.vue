<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import Globals from '/app/Globals.js';
import { randBool, randomArrayElement } from '../../../util/random';
import { capitalize, toSnakeCase, toTitleCase } from '../../../util/string';
import { first, range } from '../../../util/Array';
import BoardSelector from '../board/BoardSelector.vue';
import ModalManager from '../../ModalManager.js';
import { logUiEvent } from '../board/helpers.js';

const props = defineProps({
  mode: String,

  board: {
    size: {
      x: Number,
      y: Number
    },
    contents: {
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean, notes: { corner: { value: number, valid: boolean }[], center: { value: number, valid: boolean }[] }, colors: string[] }
    },
  },
});

let title = ref('');
let id = ref('');

const vowels = ['a', 'e', 'i', 'o', 'u', 'x'];
const adjectives = ['aardvark', 'apple', 'awesome', 'banana', 'big', 'bogus', 'cherry', 'colossal', 'choice', 'cool', 'date', 'dank', 'elderberry', 'endless', 'embodied', 'epic', 'fig', 'fantastic', 'first', 'grape', 'giant', 'great', 'good', 'honeydew', 'huge', 'iris', 'indecent', 'imperishable', 'impossible', 'juice', 'jungle', 'kiwi', 'kingly', 'lemon', 'large', 'lovely', 'legit', 'lean', 'mango', 'massive', 'monkey', 'nectarine', 'null', 'neat', 'number', 'numeric', 'orange', 'okay', 'oversized', 'papaya', 'perfect', 'primo', 'quince', 'raspberry', 'strawberry', 'straight', 'scarlet', 'second', 'subterranean', 'sus', 'tangerine', 'tall', 'talented', 'tenth', 'ugly', 'undefined', 'ultimate', 'vanilla', 'verifiable', 'watermelon', 'whimsical', 'wily', 'xray', 'yam', 'zucchini', 'zany'];
const nouns = ['advice', 'adventure', 'array', 'animism', 'box', 'boggle', 'blossom', 'business', 'chess', 'chase', 'choice', 'doubt', 'dance', 'devil', 'detour', 'entrancement', 'evening', 'epic', 'find', 'frenzy', 'guess', 'galavant', 'geometry', 'graveyard', 'grid', 'hide', 'hearsay', 'incident', 'jape', 'japes', 'journey', 'key', 'look', 'laughs', 'letter', 'list', 'madness', 'marquee', 'masquerade', 'matrix', 'mystery', 'mysticism', 'night', 'novel', 'opinion', 'order', 'object', 'olive', 'overture', 'puzzle', 'panic', 'picture', 'poetry', 'quest', 'query', 'riddle', 'riot', 'romp', 'story', 'song', 'spell', 'soiree', 'tale', 'trek', 'tour', 'tiles', 'utterance', 'view', 'voyage', 'waltz', 'whirl', 'whim', 'whimsy', 'wilderness', 'yarn', 'zeal'];

const words = [
  randomArrayElement(adjectives),
  randomArrayElement(nouns),
];
if (randBool(0.3)) {
  const firstLetter = first(words)[0];
  words.unshift(randomArrayElement([vowels.includes(firstLetter) ? 'an' : 'a', 'the']));
}

const defaultTitle = words.map(capitalize).join(' ');
const defaultId = words.join('-');

const placeholderId = computed(() => title.value ? toSnakeCase(title.value) : defaultId);

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
  
  if (numerals.includes(event.key)) {
    onNumeralInput(+event.key);

  } else if (clearDigits.includes(event.key)) {
    onNumeralInput(null);
  }
}

function onNumeralInput(value) {
  logUiEvent('onNumeralInput', value);
  Globals.gameController.interactor.handleNumeralInput(value);
}

function copyPuzzle() {
  const givens = props.board.contents.map(row =>
    row.map(cell => cell.value ?? ' ').join('')
  );

  let puzzleCode = [];

  puzzleCode.push('{');
  puzzleCode.push(`  title: '${title.value || defaultTitle}',`);
  puzzleCode.push(`  id: '${id.value || defaultId}',`);
  if (difficulty.value) {
    puzzleCode.push(`  difficulty: ${difficulty.value},`);
  }
  if (notes.value) {
    const quote = notes.value.includes("\n") ? `\`` : `'`; 
    puzzleCode.push(`  notes: ${quote}${notes.value}${quote},`);
  }
  if (props.board.size.x !== 9 || props.board.size.y !== 9) {
    puzzleCode.push(`  size: { x: ${props.board.size.x}, y: ${props.board.size.y} },`);
  }
  puzzleCode.push(`  givens: [`);
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
}
</script>

<template>
  <div class="column-wrap">
    <div class="row title">
      <label for="title">Title</label>
      <input type="text" id="title" class="title-text-input" :placeholder="defaultTitle" v-model="title" @blur="onBlurTitle"/>
    </div>
    <div class="row id">
      <label for="id">ID</label>
      <input type="text" id="id" class="id-text-input" :placeholder="placeholderId" v-model="id" @blur="onBlurId"/>
    </div>
    <div class="row notes">
      <label for="notes">Notes</label>
      <textarea id="notes" class="notes-text-area" v-model="notes"></textarea>
    </div>
    <div class="row difficulty">
      <label for="difficulty">Difficulty</label>
      <select id="difficulty" class="difficulty-select" v-model="difficulty">
        <option value=""></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
    </div>
    
    <BoardSelector :board="board" :mode="mode" />

    <div class="copy-finished">
      <div id="sudoku-puzzle-editor-copy-puzzle-button" class="copy-puzzle-button" @click="copyPuzzle">Copy as Code</div>
      <label for="sudoku-puzzle-editor-copy-puzzle-button">When finished editing your puzzle, click this button, then paste into Discord or similar to send the puzzle to me.</label>
    </div>
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

</style>