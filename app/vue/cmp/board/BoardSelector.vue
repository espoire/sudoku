<script setup>
import { onMounted, ref } from 'vue';
import DragSelectionController from './DragSelectionController';
import BoardRenderer from './BoardRenderer.vue';
import { logUiEvent } from './helpers.js';

defineProps({
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
  if (!boardComponent.value || !boardComponent.value.boardEl) throw new Error('Board element not found');
  dragger = new DragSelectionController(boardComponent.value.boardEl);
});
  
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