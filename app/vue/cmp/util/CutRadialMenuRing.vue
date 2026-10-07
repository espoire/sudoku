<script setup>
import { computed } from 'vue';
import { EPSILON, interpolate, TAU } from '../../../util/Util.js';
import RadialMenuWedge from './RadialMenuWedge.vue';
import { range as rangeFn } from '../../../util/Array.js';
const PI = Math.PI;

const props = defineProps({
  area: { x: Number, y: Number },
  center: { x: Number, y: Number },
  radii: { inner: Number, outer: Number },
  wedges: Array, // Array of objects with `text`, `color`, `onPointerUp`, `highlight` properties
  range: [
    { start: [null, Number], end: [null, Number] },
    null,
  ],
  onPointerUp: Function,
  onPointerEnter: Function,
  uidPrefix: String,
  characterLimit: [Number, null],
});

const numWedges = props.wedges.length;

// The angular range starts at the two points on y=0 at distance `radii.outer` from the center
// We will use arcsine to find the start/end angles
// Using sine, the arc needs to rise by `center.y` to reach the upper edge of the ring
const rightSideAngle = Math.asin(props.center.y / props.radii.outer);

// Use right side angle reflected across x=0 to find left side
// BUT-- we want the left one as a negative angle, for the purpose of more easily computing the total arc when going the LONG way around
// Can't just use `-rightSideAngle` because that would be a reflection across y=0, not x=0
const leftSideAngle = (PI - rightSideAngle) - TAU; // (180-angle) - 360

const availableAnglularRange = rightSideAngle - leftSideAngle;

const innerRightSideAngle = Math.asin(props.center.y / props.radii.inner);
// const extraAngularRangeForEdgePieces = innerRightSideAngle - rightSideAngle;
const innerLeftSideAngle = (PI - innerRightSideAngle) - TAU;

const innerRightSideStartX = props.center.x + props.radii.inner * Math.cos(innerRightSideAngle);
const outerRightSideStartX = props.center.x + props.radii.outer * Math.cos(rightSideAngle);

const outerLeftSideEndX = props.center.x + props.radii.outer * Math.cos(leftSideAngle);
const innerLeftSideEndX = props.center.x + props.radii.inner * Math.cos(innerLeftSideAngle);

const rangeStart = props.range?.start ?? 0;
const rangeEnd = props.range?.end ?? 1;

const angleStart = rightSideAngle - rangeStart * availableAnglularRange;
const angleEnd = rightSideAngle - rangeEnd * availableAnglularRange;

const radii = computed(() => ({
  // 0.125 is half the stroke width
  inner: props.radii.inner + 0.125,
  outer: props.radii.outer - 0.125,
}));

const wedgeData = computed(() => {
  const ret = [];

  for (let i = 0; i < numWedges; i++) {
    const start = i === 0 ? 0 : i + 0.025;
    const end = i+1 === numWedges ? numWedges : i + 0.975;

    const startPointInfo = startPoints(start);
    const endPointInfo = startPoints(end);

    ret.push({
      start: startPointInfo,
      end: endPointInfo,
    });
  }

  return ret;
});

const radiusDiff = radii.value.outer - radii.value.inner;
const textRadius = radii.value.inner + radiusDiff * 0.45; // Should go through the center of the capital letters... but it's slightly off, so 45% not 50%
const textSize = (radii.value.outer - radii.value.inner) * 0.8;

function roughlyEqual(a, b) {
  return Math.abs(a - b) < EPSILON;
}

function startPoints(i) {
  const angle = interpolate(i, 0, numWedges, angleStart, angleEnd);
  const text = {
    x: props.center.x + textRadius * Math.cos(angle),
    y: props.center.y - textRadius * Math.sin(angle),
  };

  if (roughlyEqual(angle, rightSideAngle)) return {
    inner: { x: innerRightSideStartX, y: 0.125 },
    outer: { x: outerRightSideStartX, y: 0.125 },
    text,
  };

  if (roughlyEqual(angle, leftSideAngle)) return {
    inner: { x: innerLeftSideEndX, y: 0.125 },
    outer: { x: outerLeftSideEndX, y: 0.125 },
    text,
  };


  return {
    inner: {
      x: props.center.x + radii.value.inner * Math.cos(angle),
      y: props.center.y - radii.value.inner * Math.sin(angle), // SVG y-coords are flipped relative to mathematician's
    },
    outer: {
      x: props.center.x + radii.value.outer * Math.cos(angle),
      y: props.center.y - radii.value.outer * Math.sin(angle), // SVG y-coords are flipped relative to mathematician's
    },
    text,
  };
}
</script>

<template>
  <svg class="cut-radial-menu-ring" :viewBox="`0 0 ${props.area.x} ${props.area.y}`" fill="#f00" stroke="#f88" stroke-width="0.25" :style="{ fontSize: `${textSize}px` }">
    <RadialMenuWedge
      v-for="i in rangeFn(numWedges)" :key="i"
      :radii="radii"
      :verts="wedgeData[i]"
      :uid="`${props.uidPrefix}${i}`"
      :text="props.wedges[i].text"
      :color="props.wedges[i].color"
      :highlight="props.wedges[i].highlight"
      :invertText="true"
      :characterLimit="props.characterLimit"
      @pointerup="props.wedges[i].onPointerUp"
      @pointerenter="props.wedges[i].onPointerEnter"
    />
  </svg>
</template>

<style scoped>
.cut-radial-menu-ring {
  width: 100%;
  height: 100%;
}
</style>

<!--
<svg width="400" height="200">
  <defs>
    <path id="curve" d="M50,100 Q200,0 350,100" fill="none" stroke="black"/>
  </defs>

  <text font-size="24" fill="blue" text-anchor="middle" dominant-baseline="middle">
    <textPath href="#curve" startOffset="50%">Centered Text</textPath>
  </text>
</svg>

-->
