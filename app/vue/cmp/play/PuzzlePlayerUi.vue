<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import ModalManager from '/app/vue/ModalManager.js';
import PrettyButton from '/app/vue/cmp/util/PrettyButton.vue';
import Constants from '/app/Constants.js';
import Globals from '/app/Globals.js';
import GameController from '/app/game/GameController.js';
import Timer from '/app/game/Timer.js';
import { range } from '/app/util/Array.js';
import BoardSelector from './BoardSelector.vue';
import { logUiEvent } from './helpers.js';
import VisualNumpad from './VisualNumpad.vue';
import HeaderBar from './HeaderBar.vue';

const props = defineProps({
  settings: Object,
  mode: String,

  puzzleId: [String, null],

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

  timer: {
    startTime: Number, // start time in milliseconds
    totalPausesLength: Number, // total length of all pauses in milliseconds
    paused: Boolean, // whether the timer is currently paused
    elapsedTimeAtPause: Number, // elapsed time at the moment of pause in milliseconds
  },

  inputMode: String, // 'digit' | 'corner-note' | 'center-note' | 'cell-color'

  palette: String, // 'regular' | 'color-blind'
});

// import { deepClone } from '/app/util/Object.js';
// console.log(deepClone(props));

function returnToMainMenu() {
  logUiEvent('returnToMainMenu');
  GameController.showMainMenu();
}

function openSettingsMenu() {
  logUiEvent('onClickSettingsButton');
  GameController.onSettingsClicked();
}

function onNumeralInput(value) {
  logUiEvent('onNumeralInput', value);
  Globals.gameController.interactor.handleNumeralInput(value);
}

const displayedTime = ref('');
let updateElapsedTimeInterval;
function updateElapsedTime() {
  const millis = Timer.getElapsedTime(props.timer);
  displayedTime.value = Timer.format(millis, props.settings?.timerTenths ?? true);
}
function pauseTimer() { Globals.gameController.timer.pause(); }
function resumeTimer() { Globals.gameController.timer.resume(); }

const numerals = range(0, 9).map(n => `${n}`);
const clearDigits = [' ', '-', 'Delete', 'Backspace'];
const pauseKeys = ['Pause', 'Escape'];
onMounted(() => {
  ModalManager.registerPeer('BoardSelector.vue', 'PuzzlePlayerUi.vue', { onKeydown });
  updateElapsedTime();
  updateElapsedTimeInterval = setInterval(updateElapsedTime, 100);
  resumeTimer();
});
onUnmounted(() => {
  ModalManager.unregister('PuzzlePlayerUi.vue');
  pauseTimer();
  clearInterval(updateElapsedTimeInterval);
});

function onKeydown(event) {
  logUiEvent('onKeydown', event);
  if (pauseKeys.includes(event.key)) {
    openSettingsMenu();

  } else if (numerals.includes(event.key)) {
    onNumeralInput(+event.key);

  } else if (clearDigits.includes(event.key)) {
    onNumeralInput(null);

  } else if (event.key === 'Tab') {
    if (event.shiftKey) {
      cycleInputMode('previous');
    } else {
      cycleInputMode('next');
    }
    event.preventDefault();

  } else if (event.key === '`') {
    onClickPaletteToggleButton();
  }
}

/** @param {number|null} value  The numeral clicked on the visual numpad, or null for the delete button. */
function onVisualNumpadClick(value) {
  logUiEvent('onVisualNumpadClick', value);
  onNumeralInput(value);
}

function onClickResetButton() {
  logUiEvent('onClickResetButton');
  Globals.gameController.interactor.resetPuzzle();
  Globals.gameController.timer.reset();
}

function onClickInputModeButton(mode) {
  logUiEvent('onInputModeChange', mode);
  Globals.gameController.interactor.setInputMode(mode);
}

function cycleInputMode(direction = 'next') {
  logUiEvent('cycleInputMode', direction);
  Globals.gameController.interactor.cycleInputMode(direction);
}

function onClickPaletteToggleButton() {
  logUiEvent('onClickPaletteToggleButton');
  Globals.gameController.interactor.togglePalette();
}
</script>

<template>
  <div class="column-wrap" :class="{ pen: settings.digitStyle, checkBadNotes: settings.checkBadNotes }">
    <HeaderBar :timer="settings?.timer ? displayedTime : null" @back="returnToMainMenu" @settings="openSettingsMenu" />
  
    <BoardSelector :settings="settings" :board="board" :mode="mode" />
    <div class="current-puzzle-id" v-if="puzzleId" v-text="puzzleId" />
  
    <div class="controls-footer">
      <div class="input-modes">
        <div class="input-mode-button"
            :class="{ active: inputMode === Constants.inputModes.digit }"
            @click.stop="() => onClickInputModeButton(Constants.inputModes.digit)"
        >
          Digits
        </div>
        <div class="input-mode-button"
            :class="{ active: inputMode === Constants.inputModes.cornerNote }"
            @click.stop="() => onClickInputModeButton(Constants.inputModes.cornerNote)"
        >
          Corner<br />
          Notes
        </div>
        <div class="input-mode-button"
            :class="{ active: inputMode === Constants.inputModes.centerNote }"
            @click.stop="() => onClickInputModeButton(Constants.inputModes.centerNote)"
        >
          Center<br />
          Notes
        </div>
        <div class="input-mode-button"
            :class="{ active: inputMode === Constants.inputModes.cellColor }"
            @click.stop="() => onClickInputModeButton(Constants.inputModes.cellColor)"
        >
          Highlight
        </div>
      </div>
      <VisualNumpad
        :inputMode="inputMode"
        :palette="palette"
        @numeral="onVisualNumpadClick"
        @palette-toggle="onClickPaletteToggleButton"
      />
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

.current-puzzle-id {
  color: #fffa;
  font-size: 1.3rem;
  text-align: right;
  margin-right: 1rem;
  line-height: 1;
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

  .reset-button {
    background-color: var(--color-button-destructive);
    font-size: 4rem;
  }
}
</style>