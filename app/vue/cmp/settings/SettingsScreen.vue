<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import GameController from '../../../game/GameController.js';
import ToggleSwitch from '../util/ToggleSwitch.vue';
import PrettyButton from '../util/PrettyButton.vue';
import UserSettingsManager from '../../../UserSettingsManager.js';
import ModalManager from '../../ModalManager.js';
import KeyboardHelper from '../../../util/KeyboardHelper.js';
import SaveDataManager from '../../../save/SaveDataManager.js';

defineProps(['settings']);
// const set = UserSettingsManager.setSetting;
const settingsListEl = ref(null);

function toggle(setting) {
  UserSettingsManager.toggleSetting(setting);
  doSave();
}

function doSave() {
  SaveDataManager.saveUserSettings();
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
        <label for="darkModeToggle">Theme</label>
        <ToggleSwitch
          id="darkModeToggle"
          :labels="{ off: 'Light', on: 'Dark' }"
          :on="settings.darkMode"
          @toggle="toggle('darkMode')" />
      </div>

      <!-- Show puzzle timer toggle -->
      <div>
        <label for="showTimerToggle">Timer</label>
        <ToggleSwitch
          id="showTimerToggle"
          :labels="{ off: 'Hide', on: 'Show' }"
          :on="settings.timer"
          @toggle="toggle('timer')" />
        <!-- Puzzle timer format toggle -->
        <label class="minor" :class="{ irrelevant: !settings.timer }" for="timerTenthsToggle">Format</label>
        <ToggleSwitch
          id="timerTenthsToggle"
          :class="{ irrelevant: !settings.timer }"
          :labels="{ off: '0:00', on: '0:00.0' }"
          :on="settings.timerTenths"
          @toggle="toggle('timerTenths')" />
      </div>

      <!-- Highlight active cell and row/column toggle -->
      <div>
        <label for="highlightRowColumnToggle">Highlight Cursor Row <span class="smaller">&</span> Column</label>
        <ToggleSwitch
          id="highlightRowColumnToggle"
          :labels="{ off: 'Off', on: 'Highlight' }"
          :on="settings.highlightRowColumn"
          @toggle="toggle('highlightRowColumn')" />
      </div>

      <!-- Highlight the rest of the same number as selected toggle -->
      <div>
        <label for="accentuateSameNumberToggle">Highlight Rest of Selected Number</label>
        <ToggleSwitch
          id="accentuateSameNumberToggle"
          :labels="{ off: 'Off', on: 'Highlight' }"
          :on="settings.accentuateSameNumber"
          @toggle="toggle('accentuateSameNumber')" />
      </div>

      <!-- User-entered digit style toggle -->
      <div>
        <label for="digitStyleToggle">My Digit Style</label>
        <ToggleSwitch
          id="digitStyleToggle"
          :labels="{ off: 'Pencil', on: 'Pen' }"
          :on="settings.digitStyle"
          @toggle="toggle('digitStyle')" />
        <span class="hint">Pen-style marks look just like the puzzle-given digits.</span>
      </div>

      <!-- User-notes error marking toggle -->
      <div>
        <label for="userNotesErrorMarkingToggle">Corner- and Center-Notes Rule Conflicts</label>
        <ToggleSwitch
          id="userNotesErrorMarkingToggle"
          :labels="{ off: 'Do Not Check', on: 'Check' }"
          :on="settings.checkBadNotes"
          @toggle="toggle('checkBadNotes')" />
        <ToggleSwitch
          id="deleteBadNotesToggle"
          :class="{ irrelevant: !settings.checkBadNotes }"
          :labels="{ off: 'Only Mark in Red', on: 'Delete' }"
          :on="settings.deleteBadNotes"
          @toggle="toggle('deleteBadNotes')" />
        <span class="hint" :class="{ irrelevant: !settings.checkBadNotes }">
          If set to delete, notes conflicting with the rules <br />
          will be removed when placing any non-note digits.
        </span>
      </div>

      <!-- Auto-delete erroneous notes toggle -->

      <!-- Mouseover input toggle -->
      <!-- <div>
        <label for="mouseoverInputToggle">Mouseover Digit Entry</label>
        <ToggleSwitch
          id="mouseoverInputToggle"
          :on="settings.mouseoverInput"
          @toggle="toggle('mouseoverInput')" />
        <span class="hint">When enabled, you can type digits on a keyboard to enter them directly into the puzzle, in the cell under your mouse. No effect while you have any cell(s) explicitly selected.</span>
      </div> -->

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

    transition: opacity 0.2s;

    &.minor {
      margin-top: 0.5rem;
      line-height: 1;
      font-size: 2rem;
      color: var(--color-text);
    }
  }

  .hint {
    font-size: 60%;
    font-style: italic;
    opacity: 0.7;
    margin-top: 0.5rem;
    line-height: 1.1;
    text-align: center;

    transition: opacity 0.2s;

    &.irrelevant {
      opacity: 0.2;
    }
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

  & > div {
    transition: opacity 0.2s;
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
  font-size: 70%;
}

.irrelevant {
  opacity: 0.4;

  & label {
    opacity: 0.6;    
  }

  &.minor {
    opacity: 0.3;
  }
}

.switch-wrap {
  transition: opacity 0.2s;
}
</style>