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
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean, notes: { corner: { value: number, valid: boolean }[], center: { value: number, valid: boolean }[] }, colors: string[] }
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

function onClickSettingsButton() {
  logUiEvent('onClickSettingsButton');
  GameController.onSettingsClicked();
}

function onNumeralInput(value) {
  logUiEvent('onNumeralInput', value);
  Globals.gameController.boardInteractor.handleNumeralInput(value);
}

function onUnhandledClick() {
  logUiEvent('onUnhandledClick');
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

const numerals = range(0, 9).map(n => `${n}`);
const clearDigits = [' ', '-', 'Delete', 'Backspace'];
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
  logUiEvent('onKeydown', event);
  if (event.key === 'Pause') {
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

  } else if (event.key === 'Tab') {
    if (event.shiftKey) {
      cycleInputMode('previous');
    } else {
      cycleInputMode('next');
    }
    event.preventDefault();

  } else if (event.key === '`') {
    onClickPaletteToggleButton();

  } else if (event.ctrlKey && event.key === 'a') {
    Globals.gameController.boardInteractor.selectAllCells();
  }
}

/** @param {number|null} value  The numeral clicked on the visual numpad, or null for the delete button. */
function onVisualNumpadClick(value) {
  logUiEvent('onVisualNumpadClick', value);
  onNumeralInput(value);
}

function onClickResetButton() {
  logUiEvent('onClickResetButton');
  Globals.gameController.boardInteractor.resetPuzzle();
  Globals.gameController.timer.reset();
}

function onClickInputModeButton(mode) {
  logUiEvent('onInputModeChange', mode);
  Globals.gameController.boardInteractor.setInputMode(mode);
}

function cycleInputMode(direction = 'next') {
  logUiEvent('cycleInputMode', direction);
  Globals.gameController.boardInteractor.cycleInputMode(direction);
}

function onClickPaletteToggleButton() {
  logUiEvent('onClickPaletteToggleButton');
  Globals.gameController.boardInteractor.togglePalette();
}
</script>

<template>
  <div class="column-wrap" :class="{ pen: settings.penDigitStyle, noteErrorMarks: settings.noteErrorMarks }">
    <div class="play-page-header">
      <img class="logo" src="/img/name.min.svg" />
      <div style="flex: 1" />
      <div class="elapsed-time" v-if="settings?.timer" v-text="displayedTime" />
      <img class="settings-button" src="/img/pause-button.min.svg" @click.stop="onClickSettingsButton" />
    </div>
  
    <BoardSelector :board="board" />
  
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
      <div class="visual-numpad" :class="inputMode">
        <div class="board-cell palette-toggle-button" v-if="inputMode === Constants.inputModes.cellColor"
            @click.stop="onClickPaletteToggleButton"
            :title="`Swap to ${palette === Constants.palettes.regular ? 'colorblind-friendly' : 'regular'} palette`"
        >
          🎨
          <div class="hotkey-label">`</div>
          <div class="current-palette-pips">
            <div class="pip regular" :class="{ active: (palette === Constants.palettes.regular) }" />
            <div class="pip colorblind" :class="{ active: (palette === Constants.palettes.colorBlind) }" />
          </div>
        </div>
        <div class="board-cell" v-for="n in [1,2,3,4,5,6,7,8,9, ...(inputMode === Constants.inputModes.cellColor ? [0] : [])]" :key="n"
            :class="(inputMode === Constants.inputModes.cellColor ? (n === 0 ? ['color-theme'] : (palette === Constants.palettes.regular ? [`color-c${n}`] : [`color-b${n}`])) : [])"
            @click.stop="() => onVisualNumpadClick(n)">
          <template v-if="inputMode !== Constants.inputModes.cellColor">
            {{ n }}
          </template>
          <div class="hotkey-label" v-else v-text="n"/>
        </div>
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
    height: 9rem;
    --size: 9rem;
    font-size: calc(var(--size, 10rem) * 0.7);
    margin-bottom: 10rem;

    &.cell-color {
      --size: 8rem;
      gap: 0.3rem;

      .board-cell {
        border: 1.5px solid #0004;
        &.color-c1 { background-color: var(--user-color-c1); }
        &.color-c2 { background-color: var(--user-color-c2); }
        &.color-c3 { background-color: var(--user-color-c3); }
        &.color-c4 { background-color: var(--user-color-c4); }
        &.color-c5 { background-color: var(--user-color-c5); }
        &.color-c6 { background-color: var(--user-color-c6); }
        &.color-c7 { background-color: var(--user-color-c7); }
        &.color-c8 { background-color: var(--user-color-c8); }
        &.color-c9 { background-color: var(--user-color-c9); }
        &.color-b1 { background-color: var(--user-color-b1); }
        &.color-b2 { background-color: var(--user-color-b2); }
        &.color-b3 { background-color: var(--user-color-b3); }
        &.color-b4 { background-color: var(--user-color-b4); }
        &.color-b5 { background-color: var(--user-color-b5); }
        &.color-b6 { background-color: var(--user-color-b6); }
        &.color-b7 { background-color: var(--user-color-b7); }
        &.color-b8 { background-color: var(--user-color-b8); }
        &.color-b9 { background-color: var(--user-color-b9); }
        &.color-theme { background-color: var(--user-color-theme); }
      }
    }

    .board-cell {
      position: relative;
      pointer-events: all;
      border-radius: 3rem;

      &.palette-toggle-button {
        background-color: var(--color-button);
        font-size: calc(var(--size, 10rem) * 0.55);

        .current-palette-pips {
          position: absolute;
          top: 70%;
          width: 80%;

          display: flex;
          flex-direction: row;
          justify-content: space-between;

          .pip {
            width: 0.3em;
            height: 0.3em;
            border-radius: 50%;
            border: 1.5px solid #0004;

            opacity: 0.3;

            &.active { opacity: 1; border-color: #fff4; }
            &.regular { background-color: green; }
            &.colorblind { background-color: #08f; }
          }
        }
      }

      &.delete {
        background-color: color-mix(in srgb, var(--color-button-destructive) 40%, var(--color-cells));
        font-size: calc(var(--size, 10rem) * 0.55);
      }

      .hotkey-label {
        position: absolute;
        left: 18%;
        top: 23%;
        translate: -50% -50%;
        color: var(--color-givens);
        font-size: calc(var(--size, 10rem) * 0.4);
        text-shadow: 0 0 0.025em var(--color-cells), 0 0 0.05em var(--color-cells), 0 0 0.075em var(--color-cells), 0 0 0.1em var(--color-cells), 0 0 0.125em var(--color-cells), 0 0 0.15em var(--color-cells);
      }
    }
  }

  .reset-button {
    background-color: var(--color-button-destructive);
    font-size: 4rem;
  }
}
</style>