<script setup>
import Constants from '/app/Constants.js';
import BoardCell from './BoardCell.vue';

defineProps({
  inputMode: String,
  palette: String,
});
const emit = defineEmits(['numeral', 'palette-toggle']);
</script>

<template>
  <div class="visual-numpad" :class="inputMode">
    <div class="board-cell palette-toggle-button" v-if="inputMode === Constants.inputModes.cellColor"
        :style="{ backgroundColor: palette === Constants.palettes.regular ? '#240' : '#048' }"
        @click.stop="() => emit('palette-toggle')"
        :title="`Swap to ${palette === Constants.palettes.regular ? 'colorblind-friendly' : 'regular'} palette`"
    >
      🎨
      <div class="hotkey-label">`</div>
      <div class="current-palette-pips">
        <div class="pip regular" :class="{ active: (palette === Constants.palettes.regular) }" />
        <div class="pip colorblind" :class="{ active: (palette === Constants.palettes.colorBlind) }" />
      </div>
    </div>
    <BoardCell v-for="n in [1,2,3,4,5,6,7,8,9, ...(inputMode === Constants.inputModes.cellColor ? [0] : [])]" :key="n"
      :class="(inputMode === Constants.inputModes.cellColor ? (n === 0 ? ['color-theme'] : (palette === Constants.palettes.regular ? [`color-c${n}`] : [`color-b${n}`])) : [])"
      :cell="{ value: inputMode === Constants.inputModes.cellColor ? null : n }"
      :hotkey="inputMode === Constants.inputModes.cellColor ? n : null"
      @click.stop="() => emit('numeral', n)"
    />
    <BoardCell class="delete"
      :cell="{ value: '❌' }"
      @click.stop="() => emit('numeral', null)"
    />
  </div>
</template>

<style lang="scss" scoped>
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
      width: var(--size, 10rem);
      height: var(--size, 10rem);
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 0.6rem;

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
          &.regular { background-color: #480; }
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
</style>