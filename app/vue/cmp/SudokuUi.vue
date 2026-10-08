<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import PrettyButton from './util/PrettyButton.vue';
import ModalManager from '../ModalManager.js';
import { range } from '../../util/Array.js';
import Globals from '../../Globals.js';
import GameController from '../../game/GameController.js';

const props = defineProps({
  board: {
    size: {
      x: Number,
      y: Number
    },
    contents: {
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean }
    },
  },
});

const size = computed(() => {
  const rems = 100 / Math.max(props.board.size.x, props.board.size.y);
  return `${rems}rem`;
});

function onClickSettingsButton() {
  GameController.onSettingsClicked();
}

function onActivateCell(row, column) {
  Globals.gameController.boardInteractor.handleCellActivation(row, column);
}

function onPressNumeral(value) {
  Globals.gameController.boardInteractor.handleNumeralInput(value);
}

const numerals = range(1, 9).map(n => `${n}`);
const clearDigits = [' ', '0', 'Delete', 'Backspace'];
onMounted(() => ModalManager.register('SudokuUi.vue', { onKeydown }));
onUnmounted(() => ModalManager.unregister('SudokuUi.vue'));
function onKeydown(event) {
  if (event.key === 'F1') {
    onClickSettingsButton();

  } else if (event.key === 'Escape') {
    const hasSelection = Globals.gameController.boardInteractor.hasAnySelection();
    if (hasSelection) {
      Globals.gameController.boardInteractor.clearSelection();
    } else {
      // Else open settings
      onClickSettingsButton();
    }

  } else if (numerals.includes(event.key)) {
    onPressNumeral(+event.key);

  } else if (clearDigits.includes(event.key)) {
    onPressNumeral(null);
  }
}
</script>

<template>
  <div class="play-page-header">
    <h1>
      Sudoku!
    </h1>
    <PrettyButton class="settings-button" @click="onClickSettingsButton">
      ⚙ Settings
    </PrettyButton>
  </div>

  <div class="board-wrap" :style="{ '--size': size }" v-if="props.board && props.board.size && props.board.contents">
    <div class="board-row" v-for="i in range(props.board.size.y)" :key="i">
      <div class="board-cell"
        v-for="j in range(props.board.size.x)" :key="j"
        :class="{
          given: props.board.contents[i][j].given,
          selected: props.board.contents[i][j].selected,
          'thicker-top': i%3 === 0,
          'thicker-bottom': i%3 === 2,
          'thicker-left': j%3 === 0,
          'thicker-right': j%3 === 2,
        }"
        v-text="props.board.contents[i][j].value"
        @pointerdown="() => onActivateCell(i, j)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.play-page-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  line-height: 1;
  padding: 2rem;
  margin-bottom: 2rem;
  border-bottom: .5rem solid #8886;

  h1 {
    color: var(--color-heading);
    font-weight: bold;
  }

  .settings-button {
    color: var(--color-text);
    background-color: var(--color-button-back);
    font-size: 3.5rem;
  }
}

.board-wrap {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  font-size: calc(var(--size, 10rem) * 0.7);
  line-height: 1;
  pointer-events: all;

  --half-gridline-thickness: 0.75rem;
}

.board-row {
  display: flex;
}

.board-cell {
  width: var(--size, 10rem);
  height: var(--size, 10rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-gridlines);
  color: var(--color-text);
  background-color: var(--color-cells);

  transition: outline 0.1s;

  &.given {
    font-weight: bold;
    color: var(--color-givens);
  }

  &.selected {
    --outline-size: calc(var(--size, 10rem) / 10);
    outline: var(--outline-size) solid #22fb;
    outline-offset: calc(-1 * var(--outline-size) - 2px);
  }

  &.thicker-top {
    border-top-width: var(--half-gridline-thickness, 0.5rem);
  }
  &.thicker-bottom {
    border-bottom-width: var(--half-gridline-thickness, 0.5rem);
  }
  &.thicker-left {
    border-left-width: var(--half-gridline-thickness, 0.5rem);
  }
  &.thicker-right {
    border-right-width: var(--half-gridline-thickness, 0.5rem);
  }

  &:hover {
    --outline-size: calc(var(--size, 10rem) / 20);
    outline: var(--outline-size) solid #44f4;
    outline-offset: calc(-1 * var(--outline-size) - 2px);
  }
}
</style>