<script setup lang="ts">
import Settings from '/app/Settings.js';
import Globals from '/app/Globals';
import GameController from '/app/game/GameController.js';
import HeaderBar from '../play/HeaderBar.vue';
import PrettyButton from '../util/PrettyButton.vue';
import { logUiEvent } from '../play/helpers.js';

defineProps({
  directory: {
    hasDifficulty: Object, // { 1: boolean, 2: boolean, 3: boolean, 4: boolean, 5: boolean }
  },
});

function returnToMainMenu() {
  logUiEvent('returnToMainMenu');
  GameController.showMainMenu();
}

function openSettingsMenu() {
  logUiEvent('onClickSettingsButton');
  GameController.onSettingsClicked();
}

function startPuzzle(difficulty: number) { Globals.gameController.startPuzzle(difficulty); }
function showUnratedPuzzleDirectory() { GameController.showPuzzleDirectory(); }
function shouldOfferUnratedPuzzleButton() { return Settings.test?.unratedPuzzleButton; }
</script>

<template>
  <HeaderBar @back="returnToMainMenu" @settings="openSettingsMenu" />
  <div class="difficulty-select">
    <h1>Select Difficulty</h1>
    <PrettyButton class="basic"     :disabled="!directory.hasDifficulty[1]" @activate="() => startPuzzle(1)"      :title="!directory.hasDifficulty[1] ? 'No available puzzles of this difficulty.' : null">1 - Basic    </PrettyButton>
    <PrettyButton class="easy"      :disabled="!directory.hasDifficulty[2]" @activate="() => startPuzzle(2)"      :title="!directory.hasDifficulty[2] ? 'No available puzzles of this difficulty.' : null">2 - Easy     </PrettyButton>
    <PrettyButton class="medium"    :disabled="!directory.hasDifficulty[3]" @activate="() => startPuzzle(3)"      :title="!directory.hasDifficulty[3] ? 'No available puzzles of this difficulty.' : null">3 - Medium   </PrettyButton>
    <PrettyButton class="hard"      :disabled="!directory.hasDifficulty[4]" @activate="() => startPuzzle(4)"      :title="!directory.hasDifficulty[4] ? 'No available puzzles of this difficulty.' : null">4 - Hard     </PrettyButton>
    <PrettyButton class="challenge" :disabled="!directory.hasDifficulty[5]" @activate="() => startPuzzle(5)"      :title="!directory.hasDifficulty[5] ? 'No available puzzles of this difficulty.' : null">5 - Challenge</PrettyButton>
    <PrettyButton class="expert"    :disabled="!directory.hasDifficulty[6]" @activate="() => startPuzzle(6)"      :title="!directory.hasDifficulty[6] ? 'No available puzzles of this difficulty.' : null">6 - Expert   </PrettyButton>
    <PrettyButton class="unrated"   v-if="shouldOfferUnratedPuzzleButton()" @activate="showUnratedPuzzleDirectory" title="[This option should not be visible to end-users.]"                              >Development  </PrettyButton>
  </div>
</template>

<style lang="scss" scoped>
.difficulty-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 25rem;

  h1 {
    font-size: 8rem;
    color: #fffa;
    margin-bottom: 2rem;
  }

  .buttonWrap {
    width: 43rem;
    font-size: 6rem;
    cursor: pointer;

    &.basic {
      background-color: #aed4;
    }
    &.easy {
      background-color: #afa4;
    }
    &.medium {
      background-color: #ef94;
    }
    &.hard {
      background-color: #fc94;
    }
    &.challenge {
      background-color: #fa94;
    }
    &.expert {
      background-color: #d8d4;
    }

    &.unrated {
      background-color: #ccc4;
      margin-top: 5rem;
    }
  }
}
</style>