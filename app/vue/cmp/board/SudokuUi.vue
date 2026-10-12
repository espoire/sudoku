<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import DragSelectionController from './DragSelectionController.js';
import ModalManager from '/app/vue/ModalManager.js';
import PrettyButton from '/app/vue/cmp/util/PrettyButton.vue';
import Constants from '/app/Constants.js';
import Settings from '/app/Settings.js';
import Globals from '/app/Globals.js';
import GameController from '/app/game/GameController.js';
import Timer from '/app/game/Timer.js';
import { range } from '/app/util/Array.js';
import { getLinearGradientFromColors } from './helpers.js';

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
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean, notes: { corner: number[], center: number[] }, colors: string[] }
    },
  },

  timer: {
    startTime: Number, // start time in milliseconds
    totalPausesLength: Number, // total length of all pauses in milliseconds
    paused: Boolean, // whether the timer is currently paused
    elapsedTimeAtPause: Number, // elapsed time at the moment of pause in milliseconds
  },

  inputMode: String, // 'digit' | 'corner-note' | 'center-note' | 'cell-color'
});

// import { deepClone } from '/app/util/Object.js';
// console.log(deepClone(props));

const boardEl = ref(null);
const dragger = new DragSelectionController(boardEl);

const size = computed(() => {
  const rems = 100 / Math.max(props.board.size.x, props.board.size.y);
  return `${rems}rem`;
});

function logEvent(methodName, ...args) {
  if (!Settings?.test?.log?.uiEventHandling) return;
  console.log(`[UI Event] ${methodName}`, ...args);
}

function onClickSettingsButton() {
  logEvent('onClickSettingsButton');
  GameController.onSettingsClicked();
}

function onActivateCell(row, column) {
  logEvent('onActivateCell', row, column);
  Globals.gameController.boardInteractor.handleCellActivation(row, column);
}

function onNumeralInput(value) {
  logEvent('onNumeralInput', value);
  Globals.gameController.boardInteractor.handleNumeralInput(value);
}

function onUnhandledClick() {
  logEvent('onUnhandledClick');
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
  logEvent('onKeydown', event);
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
    onNumeralInput(+event.key);

  } else if (clearDigits.includes(event.key)) {
    onNumeralInput(null);

  } else if (event.ctrlKey && event.key === 'a') {
    Globals.gameController.boardInteractor.selectAllCells();
  }
}

/** @param {number|null} value  The numeral clicked on the visual numpad, or null for the delete button. */
function onVisualNumpadClick(value) {
  logEvent('onVisualNumpadClick', value);
  onNumeralInput(value);
}

function handleDoubleClick(event) {
  logEvent('handleDoubleClick', event);
  const cellTarget = dragger.getCellTarget(event);
  if (!cellTarget) return;

  const { row, column } = cellTarget;
  Globals.gameController.boardInteractor.selectAllMatchingValues(row, column);
}

function onClickResetButton() {
  logEvent('onClickResetButton');
  Globals.gameController.boardInteractor.resetPuzzle();
}

function onClickInputModeButton(mode) {
  logEvent('onInputModeChange', mode);
  Globals.gameController.boardInteractor.setInputMode(mode);
}
</script>

<template>
  <div class="column-wrap" :class="{ pen: settings.penDigitStyle }">
    <div class="play-page-header">
      <img class="logo" src="/img/name.min.svg" />
      <div style="flex: 1" />
      <div class="elapsed-time" v-if="settings?.timer" v-text="displayedTime" />
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
          :style="{
            backgroundImage: getLinearGradientFromColors(props.board.contents[i][j].colors)
          }"
          :data-cell="`${i},${j}`"
          @pointerdown="() => onActivateCell(i, j)"
        >
          <span v-if="props.board.contents[i][j].value" v-text="props.board.contents[i][j].value" />
          <div v-else class="cell-notes">
            <div class="center-notes">
              <span class="note" v-for="n in props.board.contents[i][j].notes?.center ?? []" :key="n" v-text="n" />
            </div>
            <div class="corner-notes">
              <template v-for="n in range(1, 9)" :key="n">
                <div class="note" v-if="props.board.contents[i][j].notes?.corner?.includes(n)"
                    :class="`n${n}`"
                    v-text="n" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    <div class="controls-footer">
      <div class="input-modes">
        <div class="input-mode-button"
            :class="{ active: props.inputMode === Constants.inputModes.digit }"
            @click.stop="() => onClickInputModeButton(Constants.inputModes.digit)"
        >
          Digits
        </div>
        <div class="input-mode-button"
            :class="{ active: props.inputMode === Constants.inputModes.cornerNote }"
            @click.stop="() => onClickInputModeButton(Constants.inputModes.cornerNote)"
        >
          Corner<br />
          Notes
        </div>
        <div class="input-mode-button"
            :class="{ active: props.inputMode === Constants.inputModes.centerNote }"
            @click.stop="() => onClickInputModeButton(Constants.inputModes.centerNote)"
        >
          Center<br />
          Notes
        </div>
        <div class="input-mode-button"
            :class="{ active: props.inputMode === Constants.inputModes.cellColor }"
            @click.stop="() => onClickInputModeButton(Constants.inputModes.cellColor)"
        >
          Highlight
        </div>
      </div>
      <div class="visual-numpad">
        <div class="board-cell" v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n"
            @click.stop="() => onVisualNumpadClick(n)"
            v-text="n" />
        <div class="board-cell delete" @click.stop="() => onVisualNumpadClick(null)">❌</div>
      </div>
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
  color: var(--color-pencil);
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

.cell-notes {
  position: relative;
  width: 100%;
  height: 100%;

  .center-notes {
    position: absolute;
    left: 50%;
    top: 52.5%;
    translate: -50% -50%;
    font-size: 50%;
    font-weight: 550;    // Slight bold
    line-height: 1;

    .note {
      color: #44cc;
    }
  }

  .corner-notes {
    position: absolute;
    width: 100%;
    height: 100%;
    line-height: 1;
    font-weight: 550;    // Slight bold

    .note {
      position: absolute;
      width: 33.33%;
      height: 33.33%;
      text-align: center;
      align-content: center;
      translate: -50% -50%;
      font-size: 35%;
      color: #44cc;

      &.n1 {
        left: 10%;
        top: 15%;
      }

      &.n2 {
        left: 50%;
        top: 15%;
      }

      &.n3 {
        left: 90%;
        top: 15%;
      }

      &.n4 {
        left: 10%;
        top: 52.5%;
      }

      &.n5 {
        left: 50%;
        top: 52.5%;
      }

      &.n6 {
        left: 90%;
        top: 52.5%;
      }

      &.n7 {
        left: 10%;
        top: 90%;
      }

      &.n8 {
        left: 50%;
        top: 90%;
      }

      &.n9 {
        left: 90%;
        top: 90%;
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

  .input-modes, .visual-numpad {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  .input-modes {
    width: 100rem;
    justify-content: space-around;
    margin-bottom: 3rem;

    .input-mode-button {
      background-color: #ffffff04;
      padding: 3rem;
      height: 15rem;
      border-radius: 4rem;

      color: var(--color-text-mode-selector);
      font-size: 4.5rem;
      line-height: 1;
      text-align: center;
      align-content: center;
      pointer-events: all;

      transition: color 0.2s, opacity 0.2s, font-weight 0.2s;

      &:hover {
        color: color-mix(in srgb, var(--color-text-mode-selector) 70%, var(--color-text-mode-selector-active));
        font-weight: 550;    // Slight bold
      }

      &.active {
        color: var(--color-text-mode-selector-active);
        opacity: 1;
        font-weight: bold;
      }
    }
  }

  .visual-numpad {
    --size: 9rem;
    font-size: calc(var(--size, 10rem) * 0.7);
    margin-bottom: 10rem;

    .board-cell {
      pointer-events: all;
      border-radius: 3rem;

      &.delete {
        background-color: color-mix(in srgb, var(--color-button-destructive) 40%, var(--color-cells));
        font-size: calc(var(--size, 10rem) * 0.55);
      }
    }
  }

  .reset-button {
    background-color: var(--color-button-destructive);
    font-size: 4rem;
  }
}
</style>