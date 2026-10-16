<script setup>
import { computed, ref } from 'vue';
import { randBool, randomArrayElement } from '../../../util/random';
import { capitalize, toSnakeCase, toTitleCase } from '../../../util/string';
import { first } from '../../../util/Array';

const props = defineProps({});
let title = ref('');
let id = ref('');

const vowels = ['a', 'e', 'i', 'o', 'u', 'x'];
const adjectives = ['aardvark', 'apple', 'awesome', 'banana', 'big', 'bogus', 'cherry', 'colossal', 'choice', 'cool', 'date', 'dank', 'elderberry', 'endless', 'embodied', 'epic', 'fig', 'fantastic', 'first', 'grape', 'giant', 'great', 'good', 'honeydew', 'huge', 'iris', 'indecent', 'imperishable', 'impossible', 'juice', 'jungle', 'kiwi', 'kingly', 'lemon', 'large', 'lovely', 'legit', 'lean', 'mango', 'massive', 'monkey', 'nectarine', 'null', 'neat', 'number', 'numeric', 'orange', 'okay', 'oversized', 'papaya', 'perfect', 'primo', 'quince', 'raspberry', 'strawberry', 'straight', 'scarlet', 'second', 'subterranean', 'tangerine', 'tall', 'talented', 'tenth', 'ugly', 'undefined', 'ultimate', 'vanilla', 'verifiable', 'watermelon', 'whimsical', 'wily', 'xray', 'yam', 'zucchini', 'zany'];
const nouns = ['advice', 'adventure', 'array', 'animism', 'box', 'boggle', 'blossom', 'business', 'chess', 'chase', 'choice', 'doubt', 'dance', 'devil', 'detour', 'entrancement', 'evening', 'epic', 'find', 'frenzy', 'guess', 'galavant', 'geometry', 'graveyard', 'grid', 'hide', 'hearsay', 'incident', 'jape', 'japes', 'journey', 'key', 'look', 'laughs', 'letter', 'list', 'madness', 'marquee', 'masquerade', 'matrix', 'mystery', 'mysticism', 'night', 'novel', 'opinion', 'order', 'object', 'overture', 'puzzle', 'panic', 'picture', 'poetry', 'quest', 'query', 'riddle', 'riot', 'romp', 'story', 'song', 'spell', 'soiree', 'tale', 'trek', 'tour', 'tiles', 'utterance', 'view', 'voyage', 'waltz', 'whirl', 'whim', 'whimsy', 'wilderness', 'yarn', 'zeal'];

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
    <div class="submit-button">Submit</div>
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
  &.id { margin-bottom: 1rem; }
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

.submit-button {
  font-size: 3rem;
  padding: 0 0.4em 0.1em 0.4em;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.25em;
  cursor: pointer;
  pointer-events: all;
}
</style>