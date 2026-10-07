<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import Globals from '../../../Globals.js';
import SfxToggleButton from '../title/SfxToggleButton.vue';
import DeleteSaveGameButton from './DeleteSaveGameButton.vue';
import ToggleSwitch from '../util/ToggleSwitch.vue';
import PrettyButton from '../util/PrettyButton.vue';
import UserSettingsManager from '../../../UserSettingsManager.js';
import ModalManager from '../../ModalManager.js';
import KeyboardHelper from '../../../util/KeyboardHelper.js';

const toggle = UserSettingsManager.toggleSetting;
const set = UserSettingsManager.setSetting;

const props = defineProps(['settings']);

const settingsListElement = ref(null);

const playerName = ref(Globals.player?.name);
watch(playerName, (newVal, oldVal) => {
  if (newVal === oldVal) return;
  Globals.player.name = newVal || Constants.defaults.playerName;
  CastManager.setPlayerName(Globals.player.name);
  doSave();
});

function doSave() {
  Globals.saveFile?.save({ force: true }); // Bypass dev-test save prevention; if we manually change a setting, we want it saved.
}

function onClickReturnButton() {
  Globals.gameController.showWorldMap();
}

/** @param {'up' | 'down'} direction */
function scroll(direction) {
  const amount = direction === 'up' ? -100 : 100;
  settingsListElement.value?.scrollBy?.({ top: amount, behavior: 'smooth' });
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
  <div class="settings-screen">
    <div class="settings-header">
      <span>⚙ Settings</span>
      <PrettyButton
        style="background-color: var(--color-button-back);"
        @click="onClickReturnButton"
      >
        Return
      </PrettyButton>
    </div>

    <div class="settings-list" ref="settingsListElement">

      <!-- Change name -->
      <div v-if="Globals.player?.name != null">
        <label for="playerName">The Summoner's Name</label>
        <input
          id="playerName"
          v-model="playerName"
          placeholder="Nemo" />
      </div>

      <!-- Sounds on/off -->
      <div>
        <label for="sfxMuteToggle">Sounds</label>
        <SfxToggleButton :userSettings="props.settings" />
      </div>

      <!-- Use Mobile UI (simplified graphics) -->
      <div>
        <label for="mobileUiToggle">Simplified Combat Graphics</label>
        <span class="hint">For better performance and/or battery life.</span>
        <ToggleSwitch
          id="mobileUiToggle"
          :labels="{ off: 'Regular', on: 'Simplified' }"
          :on="props.settings.isMobile"
          @toggle="toggle('isMobile')" />
      </div>

      <!-- Show checkmarks on completed battles in Stage Select -->
      <div>
        <label for="checkmarkCompletedBattlesToggle">"Cleared" Checkmarks on World Map</label>
        <ToggleSwitch
          id="checkmarkCompletedBattlesToggle"
          :labels="{ off: 'Hide', on: 'Show' }"
          :on="props.settings.map.completedCheckmarks"
          @toggle="toggle('map.completedCheckmarks')" />
      </div>

      <!-- Story sequence: always show / skip repeats / skip always -->
      <div>
        <label>Show Roleplay Sequences</label>
        <span class="hint">For those who only wish to fight.</span>
        <div class="row">
          <PrettyButton
            :style="props.settings.roleplay.show === 'never' && {
              backgroundColor: 'green',
              fontSize: '80%',
              '--pointer-events': 'none',
            }"
            @click="set('roleplay.show', 'never')"
          >
            Never
          </PrettyButton>
          <PrettyButton
            :style="props.settings.roleplay.show === 'only-new-tutorial' ? {
              backgroundColor: 'green',
              fontSize: '45%',
              '--pointer-events': 'none',
            } : {
              fontSize: '62%',
            }"
            @click="set('roleplay.show', 'only-new-tutorial')"
          >
            Only New<br />Tutorials
          </PrettyButton>
          <PrettyButton
            :style="props.settings.roleplay.show === 'only-new' && {
              backgroundColor: 'green',
              fontSize: '80%',
              '--pointer-events': 'none',
            }"
            @click="set('roleplay.show', 'only-new')"
          >
            Any New
          </PrettyButton>
          <PrettyButton
            :style="props.settings.roleplay.show === 'always' && {
              backgroundColor: 'green',
              fontSize: '80%',
              '--pointer-events': 'none',
            }"
            @click="set('roleplay.show', 'always')"
          >
            Always
          </PrettyButton>
        </div>
        <span class="hint" style="margin-top: 1rem;">But give the story a chance, it's pretty good once it gets going!</span>
      </div>

      <!-- Auto-Advance Roleplay Text -->
      <div>
        <label for="autoAdvanceToggle">Roleplay Text</label>
        <ToggleSwitch
          id="autoAdvanceToggle"
          :labels="{ off: 'Tap to Advance', on: 'Auto' }"
          :on="props.settings.roleplay.autoAdvance"
          @toggle="toggle('roleplay.autoAdvance')" />
      </div>

      <!-- Roleplay bebebese -->
      <div>
        <label for="bebebeseToggle">Roleplay Text-Appearing Sounds</label>
        <ToggleSwitch
          id="bebebeseToggle"
          :labels="{ off: 'Glorious Silence', on: 'Takka-Takka-Takka!' }"
          :on="props.settings.roleplay.bebebese"
          @toggle="toggle('roleplay.bebebese')" />
      </div>

      <!-- Story sequence audio narration: on/off -->
      <!-- <div>
        <label for="narrationToggle">Audio Narration</label>
        <ToggleSwitch id="narrationToggle" />
      </div> -->

      <!-- Roleplay letter-by-letter appearance effect: on/off -->
      <!-- <div>
        <label for="letterByLetterToggle">Roleplay Text Speed</label>
        <ToggleSwitch id="letterByLetterToggle" :labels="{ off: 'Normal', on: 'Instant' }" />
      </div> -->

      <!-- Difficulty: Normal/Veteran
        Toggleable between battles, no effect on loot, rarely affects XP, makes the game much harder. -->
      <div>
        <label for="difficultyToggle">Combat Difficulty</label>
        <span class="hint">Veteran mode gives enemies better stats and faster turn timers.</span>
        <ToggleSwitch id="difficultyToggle"
          :labels="{ off: 'Normal', on: 'Veteran' }"
          :on="props.settings.combat?.difficulty === 'veteran'"
          @toggle="toggle('combat.difficulty')" />
      </div>

      <!-- Downscale party to battle level -->
      <div>
        <label for="downscalePartyToggle">Downscale Overlevel Allies</label>
        <span class="hint">In battles with a maximum level, allies will downscale regardless.</span>
        <ToggleSwitch
          id="downscalePartyToggle"
          :labels="{ off: 'Regular', on: `Downscale to Battle's Level` }"
          :on="props.settings.combat.downscale"
          @toggle="toggle('combat.downscale')" />
      </div>

      <!-- Prevent XP gain for party members above battle level -->
      <div>
        <label for="preventXPGainToggle">Prevent Overlevel Ally XP Gain</label>
        <span class="hint">In case you want to play lots while waiting for the next update.</span>
        <ToggleSwitch
          id="preventXPGainToggle"
          :labels="{ off: 'XP', on: `No XP if above Battle's Level` }"
          :on="props.settings.combat.preventOverlevelXp"
          @toggle="toggle('combat.preventOverlevelXp')" />
      </div>

      <div style="flex-grow: 1;" />

      <!-- Delete Save Data -->
      <div id="deleteSaveGame">
        <label>Delete Save Data</label>
        <DeleteSaveGameButton />
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
  }

  .hint {
    font-size: 60%;
    font-style: italic;
    opacity: 0.7;
    margin-top: -1.2rem;
    margin-bottom: 2rem;
    line-height: 1.2;
    text-align: center;
  }
}

.settings-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;

  background-color: var(--color-background-soft);
  width: 100%;
  height: 12dvh;
  padding: 1dvh;
  padding-bottom: 1.5rem;
  line-height: 1;
  font-size: 10rem;
  font-weight: bold;
  border-bottom: .5dvh solid #8886;
  color: var(--color-heading);
}

.settings-list {
  height: 88dvh;
  max-height: 88dvh;

  overflow-y: scroll;
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

#deleteSaveGame {
  color: red;
  font-weight: bold;
  margin-top: 10rem;
}

.smaller {
  font-size: 80%;
}
</style>