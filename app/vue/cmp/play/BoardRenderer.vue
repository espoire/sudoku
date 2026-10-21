<script setup>
import { computed, ref } from 'vue';
import BoardCell from './BoardCell.vue';
import { range } from '/app/util/Array.js';

const props = defineProps({
  board: {
    size: {
      x: Number,
      y: Number
    },
    contents: {
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean, selected: boolean, notes: { corner: { value: number, valid: boolean }[], center: { value: number, valid: boolean }[] }, colors: string[] }
    },
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
      <BoardCell 
        v-for="j in range(board.size.x)" :key="j"
        :cell="board.contents[i][j]"
        :row="i"
        :column="j"
        @activate-cell="(row, column) => emit('activate-cell', row, column)"
      />
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
}
</style>