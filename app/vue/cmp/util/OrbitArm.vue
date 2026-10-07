<script setup>
defineProps({
  period: Number,
  phaseOffset: { // In turns, preferrably between 0 and 1
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="orbit-arm" :style="{ '--period': period, '--phaseOffset': phaseOffset }">
    <div class="content-wrap">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.orbit-arm {
  // Client should set a `width` to define the orbit radius
  position: absolute;

  height: 0;
  transform-origin: left center;
  animation: orbitArmRotate linear infinite;

  @keyframes orbitArmRotate {
    from {
      rotate: 0deg;
    }
    to {
      rotate: 360deg;
    }
  }

  --delay: calc(var(--period) * var(--phaseOffset));

  animation-duration: var(--period);
  animation-delay: var(--delay);

  .content-wrap {
    position: absolute;
    left: 100%;
    top: 50%;
    translate: 0% -50%;

    animation: orbitArmRotate reverse linear infinite;
    animation-duration: var(--period);
    animation-delay: var(--delay);
  }
}
</style>