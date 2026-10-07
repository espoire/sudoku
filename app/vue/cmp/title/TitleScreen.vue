<script setup>
import { ref } from 'vue';
import Globals from '../../../Globals.js';
import { getEpithet } from './epithet.js';
import SfxToggleButton from './SfxToggleButton.vue';

const props = defineProps(['userSettings']);

const epithet = ref(getEpithet());

function onClickEpithet() {
  epithet.value = getEpithet()
}

function onClickStart() {
  Globals.gameController.onAdvanceFromTitleScreen()
}
</script>

<template>
  <!-- <AmbushBanner /> Uncomment / replace for easy Vue component testing. -->
  <div class="titleScreen">
    <div class="logoWrap">
      <span class="logo">Sudoku</span>
      <div class="epithet" v-text="epithet" @click="onClickEpithet" />
    </div>
    <div class="buttons">
      <button id="startGame" @click="onClickStart">Begin</button>
      <div id="startGameFinger">👆</div>
      <SfxToggleButton :userSettings="props.userSettings" />
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
    &:first-child {
      font-size: 16.5rem;
    }

    font-size: 12rem;
    color: rgb(from var(--color-text) r g b / 30%);
    text-transform: uppercase;
    line-height: 1;

    background: linear-gradient(80deg, green, green, blue, blue, red, red, yellow, yellow, purple, purple, pink, pink);
    background-clip: text;
    -webkit-background-clip: text;
    filter: drop-shadow(0.5rem 0.5rem 0 #fff7);
  }

  .epithet {
    position: absolute;
    left: calc(50% + 25rem);
    top: 100%;
    rotate: -20deg;
    font-size: 3rem;
    color: yellow;
    filter: drop-shadow(0.2rem 0.2rem 0 #ff08);
    animation: pulsateSize 3s linear infinite;
    line-height: 1.2;
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

      &#sfxMuteToggle {
        position: absolute;
        right: 3rem;
        bottom: 3rem;
        width: 16.61rem;
        height: 16.61rem;
        padding: 0;
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