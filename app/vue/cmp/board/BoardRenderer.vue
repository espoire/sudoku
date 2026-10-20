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

      &.error {
        .noteErrorMarks & { color: var(--color-error-text); }
      }
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

      &.error {
        .noteErrorMarks & { color: var(--color-error-text); }
      }

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
</style>