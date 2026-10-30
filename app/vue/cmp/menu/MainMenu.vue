<script setup>
import Globals from '../../../Globals';
function loadSavedPlayPuzzle() { Globals.gameController.loadSavedPlayPuzzle(); }
function showDifficultySelect() { Globals.gameController.showDifficultySelect(); }
function showPuzzleEditor() { Globals.gameController.showPuzzleEditor(); }

defineProps({ enableContinue: [Boolean, null] });
</script>

<template>
  <div class="titleScreen">
    <div class="logoWrap">
      <img class="logo" src="/img/name-shadowed.min.svg" alt="Sudoku" />
    </div>
    <div class="button-wrap" v-if="enableContinue">
      <button id="loadGame" @click="loadSavedPlayPuzzle">Continue</button>
      <div id="startGameFinger">👆</div>
    </div>
    <div class="button-wrap">
      <button id="startGame" @click="showDifficultySelect">Play</button>
      <div id="startGameFinger" v-if="!enableContinue">👆</div>
    </div>
    <div class="button-wrap">
      <button id="editPuzzle" @click="showPuzzleEditor">Create</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.titleScreen {
  display: flex;
  flex-direction: column;
  height: 100%;
  pointer-events: all;
  
  .logoWrap {
    position: relative;
    font-weight: bold;
    text-align: center;
    margin-top: 20rem;
    margin-bottom: 20rem;
  }
  
  .logo {
    margin-top: 2rem;
    max-width: 80%;
    color: #fff8;
    font-weight: bold;
    font-size: 15rem;
  }

  .button-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 5rem;

    button {
      font-size: 8rem;
      padding: 0.4em 0.6em;
      border-width: 0.125em;
      border-radius: 1em;
      cursor: pointer;
      color: var(--color-heading);
      background-color: var(--color-background-mute);
      letter-spacing: 0.15rem;

      transition: scale 0.2s, opacity 0.2s;

      &:hover {
        scale: 1.1;
        opacity: 1;
      }

      &.iconOnly {
        font-size: 7rem;
        padding: 0.5em;
        background: none;
        border: none;
      }

      &#loadGame {
        --wobble-turn: 5deg;
        animation: wobble 2s ease-in-out infinite alternate-reverse;
      }

      &#startGame {
        --wobble-turn: 5deg;
        animation: wobble 2s ease-in-out infinite alternate;
      }

      &#editPuzzle {
        font-size: 6rem;
        opacity: 0.8;
        --wobble-turn: 5deg;
        animation: wobble 2s ease-in-out infinite alternate-reverse;
        &:hover { opacity: 1; }
      }
    }

    #startGameFinger {
      position: relative;
      font-size: 7rem;
      color: var(--color-heading);
      left: 1.2em;
      top: -0.8em;
      pointer-events: none;
      animation: tapHereFinger 5s linear infinite;
    }
  }
}
</style>