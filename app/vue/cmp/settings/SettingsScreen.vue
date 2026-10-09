<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Globals from '../../../Globals.js';
import GameController from '../../../game/GameController.js';
import ToggleSwitch from '../util/ToggleSwitch.vue';
import PrettyButton from '../util/PrettyButton.vue';
import UserSettingsManager from '../../../UserSettingsManager.js';
import ModalManager from '../../ModalManager.js';
import KeyboardHelper from '../../../util/KeyboardHelper.js';

defineProps(['settings']);
const toggle = UserSettingsManager.toggleSetting;
const set = UserSettingsManager.setSetting;
const settingsListEl = ref(null);

function doSave() {
  Globals.saveFile?.save({ force: true }); // Bypass dev-test save prevention; if we manually change a setting, we want it saved.
}

function onClickReturnButton() {
  GameController.onReturnFromSettings();
}

/** @param {'up' | 'down'} direction */
function scroll(direction) {
  const amount = direction === 'up' ? -100 : 100;
  settingsListEl.value?.scrollBy?.({ top: amount, behavior: 'smooth' });
}

onMounted(() => ModalManager.register('SettingsScreen.vue', { onKeydown }));
onUnmounted(() => ModalManager.unregister('SettingsScreen.vue'));
function onKeydown(event) {
  if (event.key === ' ' || event.key === 'Escape') {
    onClickReturnButton();
  } else if (KeyboardHelper.isUp(event)) {
    scroll('up');
  } else if (KeyboardHelper.isDown(event)) {
    scroll('down');
  }
}
</script>

<template>
  <div class="settings-screen" @click.stop>
    <div class="settings-header">
      <span>⚙ Settings</span>
      <PrettyButton
        style="background-color: var(--color-button-back);"
        @click="onClickReturnButton"
      >
        Return
      </PrettyButton>
    </div>

    <div class="settings-list" ref="settingsListEl">

      <!-- Dark/light mode toggle -->
      <div>
        <label for="darkModeToggle">Dark Mode</label>
        <ToggleSwitch
          id="darkModeToggle"
          :on="settings.darkMode"
          @toggle="toggle('darkMode')" />
      </div>

      <!-- User-entered digit style toggle -->
      <div>
        <label for="penDigitStyleToggle">My Digit Style</label>
        <ToggleSwitch
          id="penDigitStyleToggle"
          :labels="{ off: 'Pencil', on: 'Pen' }"
          :on="settings.penDigitStyle"
          @toggle="toggle('penDigitStyle')" />
        <span class="hint">Pen-style marks look just like the puzzle-given digits.</span>
      </div>

      <!-- Show timer tenths toggle -->
      <div>
        <label for="showTimerTenthsToggle">Puzzle Timer Format</label>
        <ToggleSwitch
          id="showTimerTenthsToggle"
          :labels="{ off: '1:23', on: '1:23.4' }"
          :on="settings.showTimerTenths"
          @toggle="toggle('showTimerTenths')" />
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  width: 100%;
  min-height: 100%;
  font-size: 5rem;
  background-color: color-mix(in srgb, var(--color-background) 90%, transparent);

  transition: background-color 0.2s;

  button, input {
    pointer-events: all;
  }

  button {
    cursor: pointer;
  }

  input {
    display: block;
    font-size: 5rem;
    width: 90%;
    text-align: center;
  }

  label {
    margin-top: 5rem;
    font-weight: bold;
    color: var(--color-heading);
  }

  .hint {
    font-size: 60%;
    font-style: italic;
    opacity: 0.7;
    margin-top: -0.5rem;
    line-height: 1.2;
    text-align: center;
  }
}

.settings-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  background-color: var(--color-background-soft);
  width: 100%;
  padding: 1rem;
  padding-bottom: 1.5rem;
  line-height: 1;
  font-size: 4rem;
  font-weight: bold;
  border-bottom: .5rem solid #8886;
  color: var(--color-heading);
}

.settings-list {
  height: 88dvh;
  max-height: 88dvh;

  overflow-y: auto;
  pointer-events: all;

  &, & > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
}

.row {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
}

.buttonWrap {
  font-size: 5rem;
  background-color: #8888;
}

.smaller {
  font-size: 80%;
}
</style>