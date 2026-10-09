<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import DragSelectionController from './DragSelectionController.js';
import ModalManager from '/app/vue/ModalManager.js';
import PrettyButton from '/app/vue/cmp/util/PrettyButton.vue';
import Globals from '/app/Globals.js';
import Constants from '/app/Constants.js';
import GameController from '/app/game/GameController.js';
import Timer from '/app/game/Timer.js';
import { range } from '/app/util/Array.js';

const modes = Constants.modes;

const props = defineProps({
  settings: Object,
  mode: String,

  board: {
    size: {
      x: Number,
      y: Number
    },
    contents: {
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean }
    },
  },

  timer: {
    startTime: Number, // start time in milliseconds
    totalPausesLength: Number, // total length of all pauses in milliseconds
    paused: Boolean, // whether the timer is currently paused
    elapsedTimeAtPause: Number, // elapsed time at the moment of pause in milliseconds
  },
});

const boardEl = ref(null);
const dragger = new DragSelectionController(boardEl);

const size = computed(() => {
  const rems = 100 / Math.max(props.board.size.x, props.board.size.y);
  return `${rems}rem`;
});

function onClickSettingsButton() {
  GameController.onSettingsClicked();
}

function onActivateCell(row, column) {
  console.log(`Activating cell at row ${row}, column ${column}`);
  Globals.gameController.boardInteractor.handleCellActivation(row, column);
}

function onPressNumeral(value) {
  Globals.gameController.boardInteractor.handleNumeralInput(value);
}

function onUnhandledClick() {
  if (!ModalManager.isOnTop('SudokuUi.vue') || props.mode !== modes.play) return;
  Globals.gameController.boardInteractor.clearSelection();
}

const displayedTime = ref('');
let updateElapsedTimeInterval;
function updateElapsedTime() {
  const millis = Timer.getElapsedTime(props.timer);
  displayedTime.value = Timer.format(millis, props.settings?.showTimerTenths ?? true);
}
function pauseTimer() { Globals.gameController.timer.pause(); }
function resumeTimer() { Globals.gameController.timer.resume(); }

const numerals = range(1, 9).map(n => `${n}`);
const clearDigits = [' ', '0', 'Delete', 'Backspace'];
onMounted(() => {
  ModalManager.register('SudokuUi.vue', { onKeydown });
  window.addEventListener('click', onUnhandledClick);
  updateElapsedTime();
  updateElapsedTimeInterval = setInterval(updateElapsedTime, 100);
  resumeTimer();
});
onUnmounted(() => {
  ModalManager.unregister('SudokuUi.vue');
  window.removeEventListener('click', onUnhandledClick);
  pauseTimer();
  clearInterval(updateElapsedTimeInterval);
});
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

  } else if (event.ctrlKey && event.key === 'a') {
    Globals.gameController.boardInteractor.selectAllCells();
  }
}

function handleDoubleClick(event) {
  const cellTarget = getCellTarget(event);
  if (!cellTarget) return;

  const { row, column } = cellTarget;
  Globals.gameController.boardInteractor.selectAllMatchingValues(row, column);
}

function onClickResetButton() {
  Globals.gameController.boardInteractor.resetPuzzle();
}
</script>

<template>
  <div class="column-wrap" :class="{ pen: settings.penDigitStyle }">
    <div class="play-page-header">
      <img class="logo" src="/img/name.min.svg" />
      <div style="flex: 1" />
      <div class="elapsed-time" v-text="displayedTime" />
      <img class="settings-button" src="/img/pause-button.min.svg" @click.stop="onClickSettingsButton" />
    </div>
  
    <div class="board-wrap" ref="boardEl"
          v-if="props.board && props.board.size && props.board.contents"
          :style="{ '--size': size }"
          @pointerdown="dragger.start"
          @pointermove="dragger.drag"
          @pointerup="dragger.end"
          @pointercancel="dragger.end"
          @dblclick="handleDoubleClick"
          @click.stop>
      <div class="board-row" v-for="i in range(props.board.size.y)" :key="i">
        <div class="board-cell"
          v-for="j in range(props.board.size.x)" :key="j"
          :class="{
            given: props.board.contents[i][j].given,
            error: props.board.contents[i][j].error,
            selected: props.board.contents[i][j].selected,
            'thicker-top': i%3 === 0,
            'thicker-bottom': i%3 === 2,
            'thicker-left': j%3 === 0,
            'thicker-right': j%3 === 2,
          }"
          :data-cell="`${i},${j}`"
          v-text="props.board.contents[i][j].value"
          @pointerdown="() => onActivateCell(i, j)"
        />
      </div>
    </div>
  
    <div class="controls-footer">
      <PrettyButton class="reset-button" @click.stop="onClickResetButton">
        Reset this Puzzle
      </PrettyButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.column-wrap {
  display: flex;
  flex-direction: column;
  width: 100rem;
  height: 100%;
}

.play-page-header {
  display: flex;
  gap: 5rem;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  line-height: 1;
  padding: 2rem;
  margin-bottom: 2rem;
  border-bottom: .5rem solid #8886;

  .logo {
    max-width: 80%;
    max-height: 5.4rem;
  }

  .elapsed-time {
    font-size: 3rem;
    font-weight: bold;
    line-height: 1;
    color: #fffa;
  }

  .settings-button {
    pointer-events: all;
    max-height: 5.4rem;
    transition: scale 0.2s, filter 0.2s;

    &:hover {
      filter: brightness(1.2) drop-shadow(0.5rem 0.5rem 0.2rem #fff3);
      scale: 1.1;
    }
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

  .board-row {
    display: flex;

    .board-cell {
      width: var(--size, 10rem);
      height: var(--size, 10rem);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-gridlines);
      color: var(--color-text);
      background-color: var(--color-cells);
      padding-bottom: 0.6rem;

      transition: outline 0.1s;

      &.given, .pen & {
        font-weight: bold;
        color: var(--color-givens);
      }

      &.error {
        color: var(--color-error-text);
        background-color: var(--color-error);
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

      &.selected {
        --outline-size: calc(var(--size, 10rem) / 10);
        outline: var(--outline-size) solid #22fb;
        outline-offset: calc(-1 * var(--outline-size) - 2px);

        &:hover {
          outline-color: #33f8;
        }
      }
    }
  }
}

.controls-footer {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 2rem;

  .reset-button {
    background-color: var(--color-button-destructive);
    font-size: 4rem;
  }
}
</style>