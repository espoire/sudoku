<script setup>
import { ref } from "vue";
import PrettyButton from "./PrettyButton.vue";

const props = defineProps({
  seconds: Number,
});

const isHolding = ref(false);
let holdTimeout = null;
let holdStartTime = null;

const emit = defineEmits(["held"]);

function startHold() {
  if (isHolding.value) return;

  isHolding.value = true;
  holdStartTime = Date.now();

  holdTimeout = setTimeout(() => {
    const elapsed = Date.now() - holdStartTime;
    if (
      isHolding.value &&
      900 * (props.seconds ?? 1) < elapsed && elapsed < 1100 * (props.seconds ?? 1)   // To protect against e.g. a lag spike or mobile browser minimize&suspend at the wrong time
    ) emit('held');
  }, 1000 * (props.seconds ?? 1));
}

function cancelHold() {
  isHolding.value = false;
  clearTimeout(holdTimeout);
}
</script>

<template>
  <PrettyButton class="holdButton"
    @pointerdown="startHold"
    @pointerup="cancelHold"
    @pointerleave="cancelHold"
    @pointercancel="cancelHold"
  >
    <template v-slot:special>
      <div class="fill-wrap">
        <div class="fill" :style="{ animationDuration: `${props.seconds ?? 1}s` }" />
      </div>
    </template>
    <slot />
  </PrettyButton>
</template>

<style lang="scss" scoped>
.holdButton {
  .fill-wrap {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 0.625em;
    overflow: hidden;
    background-color: var(--background-color, #600);
  }

  .fill {
    position: absolute;
    width: 0%;
    height: 100%;
    background-color: var(--fill-color, #F00);
  }

  &:active .fill {
    /* Start the animation when the button is pressed */
    animation: fillBackground 5s forwards linear;
  }
}

@keyframes fillBackground {
  from { width: 0%; }
  to { width: 100%; }
}
</style>