<script setup>
import { computed } from 'vue';

const props = defineProps({
  radii: {
    inner: { x: Number, y: Number },
    outer: { x: Number, y: Number },
  },
  verts: {
    start: {
      inner: { x: Number, y: Number },
      outer: { x: Number, y: Number },
      text: { x: Number, y: Number },
    },
    end: {
      inner: { x: Number, y: Number },
      outer: { x: Number, y: Number },
      text: { x: Number, y: Number },
    },
  },
  uid: String,
  text: String,
  color: String,
  highlight: Boolean,
  invertText: Boolean,
  characterLimit: [Number, null],
});

const maxChars = props.characterLimit ?? 3.7; // TODO compute based on text size & wedge size
const fontSize = computed(() => {
  const chars = props.text?.length ?? 0;
  if (chars < maxChars) return null;
  return `${(maxChars / chars) * 100}%`;
});

const textColor = computed(() => {
  return props.highlight ? 'white' : '#0008';
});
const wedgeStrokeColor = computed(() => {
  return props.highlight ? `color-mix(in srgb, ${props.color}, black 40%)` : `color-mix(in srgb, ${props.color}, white 20%)`;
});
const wedgeFillColor = computed(() => {
  return props.highlight ? `color-mix(in srgb, ${props.color}, black 90%)` : props.color;
});
</script>

<template>
  <g class="radial-menu-wedge" :stroke="wedgeStrokeColor" :fill="wedgeFillColor">
    <path :d="
      `M ${props.verts.start.inner.x} ${props.verts.start.inner.y}` +                                                  // Init cursor to start point
      `L ${props.verts.start.outer.x} ${props.verts.start.outer.y}` +                                                  // Draw line to outer start point
      `A ${props.radii.outer} ${props.radii.outer} 0 0 1 ${props.verts.end.outer.x} ${props.verts.end.outer.y}` +      // Draw arc to outer end point
      `L ${props.verts.end.inner.x} ${props.verts.end.inner.y}` +                                                      // Draw line to inner end point
      `A ${props.radii.inner} ${props.radii.inner} 0 0 0 ${props.verts.start.inner.x} ${props.verts.start.inner.y}` +  // Draw arc back to inner start point
      'Z'                                                                                                              // Close path
    " />
    <template v-if="props.text">
      <defs>
        <path :id="`radial-menu-wedge-text-path-${props.uid}`" :d="
          `M ${props.invertText ? props.verts.end.text.x : props.verts.start.text.x
          } ${props.invertText ? props.verts.end.text.y : props.verts.start.text.y}` +  // Init cursor to text start point

          `A ${props.radii.inner} ${props.radii.inner} 0 0 ${props.invertText ? 0 : 1} ${
          props.invertText ? props.verts.start.text.x : props.verts.end.text.x
          } ${props.invertText ? props.verts.start.text.y : props.verts.end.text.y}` // Draw arc to text end point
        " />
      </defs>
      <text :style="{ fontSize, fontWeight: props.highlight ? 'bold' : null }" :fill="textColor">
        <textPath :href="`#radial-menu-wedge-text-path-${props.uid}`" startOffset="50%">
          {{ props.text }}
        </textPath>
      </text>
    </template>
  </g>
</template>

<style scoped>
.radial-menu-wedge {
  pointer-events: all;
  cursor: pointer;

  text {
    stroke: none;
    text-anchor: middle;
    dominant-baseline: middle;
  }
}
</style>