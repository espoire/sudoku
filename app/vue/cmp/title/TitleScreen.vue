<script setup>
import Globals from '../../../Globals.js';

defineProps(['userSettings']);

function onClickStart() {
  Globals.gameController.onAdvanceFromTitleScreen()
}
</script>

<template>
  <!-- <AmbushBanner /> Uncomment / replace for easy Vue component testing. -->
  <div class="titleScreen">
    <div class="logoWrap">
      <img class="logo" src="/img/name-shadowed.min.svg" />
    </div>
    <div class="buttons">
      <button id="startGame" @click="onClickStart">Begin</button>
      <div id="startGameFinger">👆</div>
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
  }
  
  .logo {
    margin-top: 2rem;
    max-width: 80%;
  }

  .buttons {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    button {
      font-size: 8rem;
      padding: 0.4em 0.6em;
      border-width: 0.125em;
      border-radius: 1em;
      cursor: pointer;
      color: var(--color-heading);
      background-color: var(--color-background-mute);
      letter-spacing: 0.15rem;

      &:hover {
        scale: 1.1;
      }

      &.iconOnly {
        font-size: 7rem;
        padding: 0.5em;
        background: none;
        border: none;
      }

      &#startGame {
        --wobble-turn: 5deg;
        animation: wobble 2s ease-in-out -1s infinite alternate;
      }
    }

    #startGameFinger {
      position: relative;
      font-size: 7rem;
      color: var(--color-heading);
      left: 1.4em;
      top: -0.6em;
      pointer-events: none;
      animation: tapHereFinger 5s linear infinite;
    }
  }
}
</style>