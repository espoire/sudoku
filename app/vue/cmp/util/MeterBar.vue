<script setup>
defineProps({
  percent: Number,
});
</script>

<template>
  <div class="meterBar">
    <div class="fill" :style="{ width: `${Math.max(0, percent)}%` }" />
  </div>
</template>

<style scoped>
.meterBar {
  position: relative;
  height: 1ex;
  background-color: #4448;
  border: 0.2ex solid #fff8;
  border-radius: 0.5ex;
  overflow: hidden;

  .fill {
    position: absolute;
    height: 100%;
    background-color: #fffb;
    transition: width 0.5s ease-in-out;
  }
}
</style>