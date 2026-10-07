<script setup>
import { computed } from 'vue';
import { range } from '../../util/Array.js';

const props = defineProps({
  board: {
    size: {
      x: Number,
      y: Number
    },
    contents: {
      type: Array, // 2d array of Cell descriptor objects: { value: number, given: boolean }
    },
  },
});

const size = computed(() => {
  const rems = 100 / Math.max(props.board.size.x, props.board.size.y);
  return `${rems}rem`;
});

function onActivateCell(event) {
  console.log("Cell activated:", event.target);
  // TODO
}
</script>

<template>
  <h1>
    Sudoku!
  </h1>

  <div class="boardWrap" :style="{ '--size': size }" v-if="props.board && props.board.size && props.board.contents">
    <div class="boardRow" v-for="i in range(props.board.size.y)" :key="i">
      <div class="boardCell"
        v-for="j in range(props.board.size.x)" :key="j"
        :class="{ given: props.board.contents[i][j].given }"
        v-text="props.board.contents[i][j].value"
        @pointerdown="onActivateCell"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.boardWrap {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  font-size: calc(var(--size, 10rem) * 0.7);
  line-height: 1;
  pointer-events: all;
}

.boardRow {
  display: flex;
}

.boardCell {
  width: var(--size, 10rem);
  height: var(--size, 10rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #000;
  color: #44f;

  transition: outline 0.1s;

  &.given {
    font-weight: bold;
    color: #000;
  }

  &:hover {
    --outline-size: calc(var(--size, 10rem) / 20);
    outline: var(--outline-size) solid #44f4;
    outline-offset: calc(-1 * var(--outline-size) - 2px);
  }
}
</style>