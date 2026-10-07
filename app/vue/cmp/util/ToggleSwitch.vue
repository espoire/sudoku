// TODO just imported from ChatGPT; test, proofread, use for more Settings

<script setup>
import { ref } from 'vue';
import Sound from '../../../Sound.js';

const props = defineProps({
  on: Boolean,
  labels: {
    type: Object,
    default: () => ({ off: 'Off', on: 'On' }),
  },
});

const emit = defineEmits(['toggle']);
const isOn = ref(props.on);

function toggle() {
  isOn.value = !isOn.value;
  emit('toggle', isOn.value);
  Sound.swapClick.play({
    rate: isOn.value ? 1.5 : 1,
  });
}
</script>

<template>
  <div class="switch-wrap" @click="toggle">
    <span class="label left" :class="{ inactive: isOn }">{{ labels.off }}</span>
    <div class="switch" :class="{ on: isOn }">
      <div class="slider"></div>
    </div>
    <span class="label right" :class="{ inactive: !isOn }">{{ labels.on }}</span>
  </div>
</template>

<style scoped>
.switch-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: all;
  cursor: pointer;

  &:hover {
    .switch {
      scale: 110%;
    }

    .slider {
      background-color: #fff;
    }
  }
}

.switch {
  width: 10rem;
  height: 5rem;
  padding: 0.5rem;
  border-radius: 2.5rem;
  background-color: #ccc;
  position: relative;
  margin-left: 2rem;
  margin-right: 2rem;
  transition:
    background-color 0.3s,
    scale 0.1s;
}

.switch.on {
  background-color: #4caf50;
}

.slider {
  position: absolute;
  width: 4rem;
  height: 4rem;
  background: #eee;
  border-radius: 50%;
  transition:
    translate 0.3s,
    background-color 0.3s;
}

.switch.on .slider {
  translate: 5rem;
}

.label {
  font-size: 4rem;
  transition: opacity 0.3s;
}

.inactive {
  opacity: 0.5;
}
</style>
