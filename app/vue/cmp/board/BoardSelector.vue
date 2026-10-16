<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Constants from '/app/Constants.js';
import DragSelectionController from './DragSelectionController';
import BoardRenderer from './BoardRenderer.vue';
import { logUiEvent } from './helpers.js';
import ModalManager from '../../ModalManager.js';

const modes = Constants.modes;

const props = defineProps({
  mode: String,

  board: {
    size: {
      x: Number,
      y: Number,
    },
    contents: {
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean, notes: { corner: { value: number, valid: boolean }[], center: { value: number, valid: boolean }[] }, colors: string[] }
    },
  },
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

  // [Escape] Clear selection if any
  if (event.key === 'Escape') {
    const hasSelection = Globals.gameController.boardInteractor.hasAnySelection();
    if (hasSelection) {
      Globals.gameController.boardInteractor.clearSelection();
      return false; // Mark event handled, so earlier peers in ModalManager won't receive it.
    }

  // [Ctrl+A] Select all cells
  } else if (event.ctrlKey && event.key === 'a') {
    Globals.gameController.boardInteractor.selectAllCells();
    return false; // Mark event handled, so earlier peers in ModalManager won't receive it.
  }
}

function onUnhandledClick() {
  logUiEvent('onUnhandledClick');
  if (!ModalManager.isOnTop('SudokuUi.vue') || props.mode === modes.settings) return;
  Globals.gameController.boardInteractor.clearSelection();
}
  
function onActivateCell(row, column) {
  logUiEvent('onActivateCell', row, column);
  Globals.gameController.boardInteractor.handleCellActivation(row, column);
}

function handleDoubleClick(event) {
  logUiEvent('handleDoubleClick', event);
  const cellTarget = dragger.getCellTarget(event);
  if (!cellTarget) return;

  const { row, column } = cellTarget;
  Globals.gameController.boardInteractor.selectAllMatchingValues(row, column);
}
</script>

<template>
  <BoardRenderer ref="boardComponent"
      :board="board"
      @activate-cell="onActivateCell"
      @pointerdown="(event) => dragger.start(event)"
      @pointermove="(event) => dragger.drag(event)"
      @pointerup="(event) => dragger.end(event)"
      @pointercancel="(event) => dragger.end(event)"
      @dblclick="handleDoubleClick"
      @click.stop />
</template>