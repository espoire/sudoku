<script setup>
import Globals from '../../../Globals';
function onClickPlay() { Globals.gameController.startPuzzle(); }
function onClickCreate() { Globals.gameController.showPuzzleEditor(); }
</script>

<template>
  <div class="titleScreen">
    <div class="logoWrap">
      <img class="logo" src="/img/name-shadowed.min.svg" />
    </div>
    <div class="button-wrap">
      <button id="startGame" @click="onClickPlay">Play</button>
      <div id="startGameFinger">👆</div>
    </div>
    <div class="button-wrap">
      <button id="editPuzzle" @click="onClickCreate">Create</button>
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