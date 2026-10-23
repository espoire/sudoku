<script setup>
import { computed, ref } from 'vue';
import BoardCell from './BoardCell.vue';
import { range } from '/app/util/Array.js';

const props = defineProps({
  settings: Object,
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
    accentuate: [Number, null],
  },
});
const emit = defineEmits(['activate-cell']);

const boardEl = ref(null);
defineExpose({ boardEl });

const size = computed(() => {
  const rems = 100 / Math.max(props.board.size.x, props.board.size.y);
  return `${rems}rem`;
});
</script>

<template>
  <div class="board-wrap" ref="boardEl"
        v-if="board && board.size && board.contents"
        :style="{ '--size': size }">
    <div class="board-row" v-for="i in range(board.size.y)" :key="i">
      <div class="cell-wrap" v-for="j in range(board.size.x)" :key="j"
          :class="{
            active:          settings.highlightRowColumn && (board.active?.row === i && board.active?.column === j),
            sameRowOrColumn: settings.highlightRowColumn && (board.active?.row === i || board.active?.column === j),
            accentuated: settings.accentuateSameNumber && (board.accentuate != null && board.accentuate === board.contents[i][j].value),
          }">
        <BoardCell
          :cell="board.contents[i][j]"
          :row="i"
          :column="j"
          @activate-cell="(...args) => emit('activate-cell', ...args)"
        />
        <div class="cellTintOverlay" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
  flex-direction: row;
}

.cell-wrap {
  position: relative;
  width: fit-content;
  height: fit-content;
}

.cellTintOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.accentuated .cellTintOverlay {
  background-color: #08f4;
}

.sameRowOrColumn .cellTintOverlay {
  background-color: #f802;
}

.active .cellTintOverlay {
  background-color: #f804;
}
</style>