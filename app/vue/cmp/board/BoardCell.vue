<script setup>
import { range } from '/app/util/Array.js';
import { getLinearGradientFromColors } from './helpers.js';

const emit = defineEmits(['activate-cell']);
defineProps({
  cell: {
    given: Boolean,
    error: Boolean,
    selected: Boolean,
    value: Number,
    notes: {
      type: Object,
      default: () => ({ corner: [], center: [] })
    },
    colors: {
      type: Array,
      default: () => []
    }
  },
  row: Number,
  column: Number,
});
</script>

<template>
  <div class="board-cell"
    :class="{
      given: cell.given,
      error: cell.error,
      selected: cell.selected,
      'thicker-top': row%3 === 0,
      'thicker-bottom': row%3 === 2,
      'thicker-left': column%3 === 0,
      'thicker-right': column%3 === 2,
    }"
    :style="{
      backgroundImage: getLinearGradientFromColors(cell.colors)
    }"
    :data-cell="`${row},${column}`"
    @pointerdown="() => emit('activate-cell', row, column)"
  >
    <span v-if="cell.value" v-text="cell.value" />
    <div v-else class="cell-notes">
      <div class="center-notes">
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
  </div>
</template>