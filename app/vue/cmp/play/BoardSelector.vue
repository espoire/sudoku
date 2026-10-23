<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Constants from '/app/Constants.js';
import Globals from '/app/Globals.js';
import DragSelectionController from '../play/DragSelectionController.js';
import BoardRenderer from './BoardRenderer.vue';
import { logUiEvent } from '../play/helpers.js';
import ModalManager from '../../ModalManager.js';
import KeyboardHelper from '../../../util/KeyboardHelper.js';

const modes = Constants.modes;

const props = defineProps({
  settings: Object,
  mode: String,

  board: {
    size: {
      x: Number,
      y: Number,
    },
    contents: {
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean, notes: { corner: { value: number, valid: boolean }[], center: { value: number, valid: boolean }[] }, colors: string[] }
    },
    active: {
      type: Object, // { row: number, column: number } representing the active cell, or null if no cell is active.
      default: null
    },
  },

  suppressKeyboard: [Boolean, null],
});

const boardComponent = ref(null);
let dragger;

onMounted(() => {
  ModalManager.register('BoardSelector.vue', { onKeydown });
  window.addEventListener('click', onUnhandledClick);
  dragger = new DragSelectionController(boardComponent.value.boardEl);
});
onUnmounted(() => {
  ModalManager.unregister('BoardSelector.vue');
  window.removeEventListener('click', onUnhandledClick);
});

function onKeydown(event) {
  logUiEvent('onKeydown', event);
  if (props.suppressKeyboard) return;

  // [Escape] Clear selection if any
  if (event.key === 'Escape') {
    const hasSelection = Globals.gameController.interactor.hasAnySelection();
    if (hasSelection) {
      Globals.gameController.interactor.clearSelection();
      return false; // Mark event handled, so earlier peers in ModalManager won't receive it.
    }

  // [Ctrl+A] Select all cells
  } else if (event.ctrlKey && event.key === 'a') {
    Globals.gameController.interactor.selectAllCells();
    return false; // Mark event handled, so earlier peers in ModalManager won't receive it.

  } else if (KeyboardHelper.isUp(event)) {
    Globals.gameController.interactor.moveSelection('up');
    return false; // Mark event handled, so earlier peers in ModalManager won't receive it.

  } else if (KeyboardHelper.isDown(event)) {
    Globals.gameController.interactor.moveSelection('down');
    return false; // Mark event handled, so earlier peers in ModalManager won't receive it.

  } else if (KeyboardHelper.isLeft(event)) {
    Globals.gameController.interactor.moveSelection('left');
    return false; // Mark event handled, so earlier peers in ModalManager won't receive it.

  } else if (KeyboardHelper.isRight(event)) {
    Globals.gameController.interactor.moveSelection('right');
    return false; // Mark event handled, so earlier peers in ModalManager won't receive it.
  }
}

function onUnhandledClick() {
  logUiEvent('onUnhandledClick');
  if (!ModalManager.isOnTop('PuzzlePlayerUi.vue') || props.mode === modes.settings) return;
  Globals.gameController.interactor.clearSelection();
}

function onActivateCell(row, column, ctrlKey) {
  logUiEvent('onActivateCell', row, column, ctrlKey);
  Globals.gameController.interactor.handleCellActivation(row, column, ctrlKey);
}

function handleDoubleClick(event) {
  logUiEvent('handleDoubleClick', event);
  const cellTarget = dragger.getCellTarget(event);
  if (!cellTarget) return;

  const { row, column } = cellTarget;
  Globals.gameController.interactor.selectAllMatchingValues(row, column);
}
</script>

<template>
  <BoardRenderer ref="boardComponent"
      :settings="settings"
      :board="board"
      @activate-cell="onActivateCell"
      @pointerdown="(event) => dragger.start(event)"
      @pointermove="(event) => dragger.drag(event)"
      @pointerup="(event) => dragger.end(event)"
      @pointercancel="(event) => dragger.end(event)"
      @dblclick="handleDoubleClick"
      @click.stop />
</template>