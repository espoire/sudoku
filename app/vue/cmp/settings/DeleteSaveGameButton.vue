<script setup>
import { reactive, ref } from "vue";
import Sound from "../../../Sound.js";
import Globals from "../../../Globals.js";

const isHolding = ref(false);
let holdTimeout = null;
let holdStartTime = null;

function onHeld5Sec() {
  Sound.specialMove?.explosion?.play();
  Globals.saveFile.reset();
  Globals.saveFile.save({ force: true });
  hideButton();
  setTimeout(() => location.reload(), 1000);
}

function startHold() {
  if (isHolding.value) return;

  isHolding.value = true;
  holdStartTime = Date.now();

  holdTimeout = setTimeout(() => {
    const elapsed = Date.now() - holdStartTime;
    if (
      isHolding.value &&
      4500 < elapsed && elapsed < 5500   // To protect against e.g. a lag spike or mobile browser minimize&suspend at the wrong time
    ) onHeld5Sec();
  }, 5000);
}

function cancelHold() {
  isHolding.value = false;
  clearTimeout(holdTimeout);
}

function hideButton() {
  buttonStyle.pointerEvents = "none";
  buttonStyle.opacity = "0%";
}

const buttonStyle = reactive({});
</script>

<template>
  <button id="deleteSaveGameButton"
    :style="buttonStyle"
    @pointerdown="startHold"
    @pointerup="cancelHold"
    @pointerleave="cancelHold"
    @pointercancel="cancelHold"
  >
    Press and Hold
  </button>
</template>

<style lang="scss" scoped>
#deleteSaveGameButton {
  font-size: 12rem;
  color: var(--color-heading);
  background-color: var(--color-background-mute);
  border: 0.5dvmin solid #800;
  border-radius: 2rem;
  margin-bottom: 10rem;
  opacity: 100%;
  transition: opacity 0.5s;

  /* Set up a red gradient that will act as the fill */
  background-image: linear-gradient(to right, red, red 90%, #F000);
  background-repeat: no-repeat;
  background-size: 0% 100%;

  --wobble-turn: 1deg;

  &:active {
    /* Start the animation when the button is pressed */
    animation: fillBackground 5s forwards linear, wobble 0.1s 15 3.5s alternate linear, growAtEnd 1s 1 4s linear;
  }

  &:not(:active):hover {
    animation: pulsateBorderColor 0.5s infinite alternate linear;
  }
}

@keyframes fillBackground {
  from { background-size: 0% 100%; }
  to { background-size: 111.12% 100%; }
}

@keyframes growAtEnd {
  0% { scale: 1; }
  95% { scale: 1.1; }
  99% { scale: 0.9; }
  100% { scale: 1; }
}

@keyframes pulsateBorderColor {
  from { border-color: #800; }
  to { border-color: #F00; }
}
</style>