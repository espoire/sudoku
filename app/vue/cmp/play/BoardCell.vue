<script setup>
import { range } from '/app/util/Array.js';
import { getLinearGradientFromColors } from './helpers.js';

const emit = defineEmits(['activate-cell']);
defineProps({
  cell: {
    given: [Boolean, null],
    error: [Boolean, null],
    selected: [Boolean, null],
    value: [Number, String],
    notes: {
      type: Object,
      default: () => ({ corner: [], center: [] })
    },
    colors: {
      type: Array,
      default: () => []
    }
  },
  row: [Number, null],
  column: [Number, null],
  hotkey: [String, Number, null]
});
</script>

<template>
  <div class="board-cell"
    :class="{
      given: cell.given,
      error: cell.error,
      selected: cell.selected,
      'thicker-top': row != null && row%3 === 0,
      'thicker-bottom': row != null && row%3 === 2,
      'thicker-left': column != null && column%3 === 0,
      'thicker-right': column != null && column%3 === 2,
    }"
    :style="{
      backgroundImage: getLinearGradientFromColors(cell.colors)
    }"
    :data-cell="row != null && column != null ? `${row},${column}` : ''"
    @pointerdown="(event) => emit('activate-cell', row, column, event.ctrlKey)"
  >
    <span v-if="cell.value" v-text="cell.value" />
    <div v-else class="cell-notes">
      <div class="center-notes" :style="{ fontSize: `${Math.min(45, 240/(cell.notes?.center ?? []).length)}%` }">
        <span class="note" :class="{ error: !n.valid }" v-for="n in cell.notes?.center ?? []" :key="n.value" v-text="n.value" />
      </div>
      <div class="corner-notes">
        <template v-for="n in range(1, 9)" :key="n">
          <div class="note" v-if="cell.notes?.corner?.some(v => v.value === n)"
              :class="[`n${n}`, (!cell.notes?.corner?.find(v => v.value === n).valid) ? 'error' : '']"
              v-text="n" />
        </template>
      </div>
    </div>
    <div class="hotkey-label" v-if="hotkey != null" v-text="hotkey" />
  </div>
</template>

<style lang="scss" scoped>
.board-cell {
  position: relative;
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
    font-size: 45%;
    font-weight: 550;    // Slight bold
    line-height: 1;

    .note {
      color: #44cc;

      &.error {
        .checkBadNotes & { color: var(--color-error-text); }
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
        .checkBadNotes & { color: var(--color-error-text); }
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

.hotkey-label {
  position: absolute;
  left: 18%;
  top: 23%;
  translate: -50% -50%;
  color: var(--color-givens);
  font-size: calc(var(--size, 10rem) * 0.4);
  text-shadow: 0 0 0.025em var(--color-cells), 0 0 0.05em var(--color-cells), 0 0 0.075em var(--color-cells), 0 0 0.1em var(--color-cells), 0 0 0.125em var(--color-cells), 0 0 0.15em var(--color-cells);
}
</style>