<script setup>
defineProps({
  timer: [String, null], // displayed time string or null if timer is not shown
});
const emit = defineEmits(['back', 'settings']);
</script>

<template>
  <div class="header-bar">
    <img class="logo" src="/img/name.min.svg" alt="Sudoku" @click.stop="emit('back')" />
    <div style="flex: 1" />
    <div class="elapsed-time" v-if="timer" v-text="timer" />
    <img class="settings-button" src="/img/pause-button.min.svg" alt="Pause" @click.stop="emit('settings')" />
  </div>
</template>

<style lang="scss" scoped>
.header-bar {
  width: 100%;
  display: flex;
  gap: 5rem;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  line-height: 1;
  padding: 2rem;
  margin-bottom: 2rem;
  border-bottom: .5rem solid #8886;

  img {
    color: #fff8;
    font-weight: bold;
    font-size: 5rem;
  }

  .logo {
    min-width: 17rem;
    height: 5.4rem;

    pointer-events: all;
    transition: scale 0.2s, filter 0.2s;
    &:hover {
      filter: brightness(1.2) drop-shadow(0.5rem 0.5rem 0.2rem #fff3);
      scale: 1.1;
    }
  }

  .elapsed-time {
    font-size: 3rem;
    font-weight: bold;
    line-height: 1;
    color: #fffa;
  }

  .settings-button {
    min-width: 5rem;
    height: 5.4rem;

    pointer-events: all;
    transition: scale 0.2s, filter 0.2s;
    &:hover {
      filter: brightness(1.2) drop-shadow(0.5rem 0.5rem 0.2rem #fff3);
      scale: 1.1;
    }
  }
}
</style>