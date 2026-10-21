<script setup lang="ts">
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
</script>

<template>
  <HeaderBar @back="returnToMainMenu" @settings="openSettingsMenu" />
  <div class="difficulty-select">
    <h1>Select Difficulty</h1>
    <PrettyButton class="beginner" :disabled="!directory.hasDifficulty[1]" @activate="() => startPuzzle(1)"      :title="!directory.hasDifficulty[1] ? 'No available puzzles of this difficulty.' : null">1 - Beginner</PrettyButton>
    <PrettyButton class="easy"     :disabled="!directory.hasDifficulty[2]" @activate="() => startPuzzle(2)"      :title="!directory.hasDifficulty[2] ? 'No available puzzles of this difficulty.' : null">2 - Easy    </PrettyButton>
    <PrettyButton class="medium"   :disabled="!directory.hasDifficulty[3]" @activate="() => startPuzzle(3)"      :title="!directory.hasDifficulty[3] ? 'No available puzzles of this difficulty.' : null">3 - Medium  </PrettyButton>
    <PrettyButton class="hard"     :disabled="!directory.hasDifficulty[4]" @activate="() => startPuzzle(4)"      :title="!directory.hasDifficulty[4] ? 'No available puzzles of this difficulty.' : null">4 - Hard    </PrettyButton>
    <PrettyButton class="expert"   :disabled="!directory.hasDifficulty[5]" @activate="() => startPuzzle(5)"      :title="!directory.hasDifficulty[5] ? 'No available puzzles of this difficulty.' : null">5 - Expert  </PrettyButton>
    <PrettyButton class="unrated"                                          @activate="showUnratedPuzzleDirectory"                                                                                        >Unrated     </PrettyButton>
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

    &.beginner {
      background-color: #a8e6cf44;
    }
    &.easy {
      background-color: #dcedc144;
    }
    &.medium {
      background-color: #ffd3b644;
    }
    &.hard {
      background-color: #ffaaa544;
    }
    &.expert {
      background-color: #ff8b9444;
    }
    &.unrated {
      background-color: #cccccc44;
      margin-top: 5rem;
    }
  }
}
</style>