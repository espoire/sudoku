<script setup>
import { computed } from 'vue';
import UserSettingsManager from '../../../UserSettingsManager.js';
import Sound from '../../../Sound.js';

const props = defineProps(['userSettings']);

const soundIcon = computed(() => props.userSettings.sound.effects ? '🔊' : '🔈');

function onClickSfx() {
  UserSettingsManager.toggleSetting('sound.effects')
  Sound.breakTink.play({ rateJitter: 0.2 })
}
</script>

<template>
  <button id="sfxMuteToggle" @click="onClickSfx" v-text="soundIcon" />
</template>

<style lang="scss" scoped>
#sfxMuteToggle {
  pointer-events: all;

  font-size: 7rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-heading);

  &:hover {
    scale: 1.1;
  }
}
</style>