<script setup>
import Globals from '/app/Globals.js';

defineProps({
  puzzles: Array, // { id: string, title: string }[]
});

function onClickPuzzleButton(puzzleId) {
  Globals.gameController.startPuzzleById(puzzleId);
}
</script>

<template>
  <div class="puzzle-directory">
    <div class="puzzle-button"
        v-for="puzzle in puzzles" :key="puzzle.id"
        @click="onClickPuzzleButton(puzzle.id)"
        v-text="puzzle.title" />
  </div>
</template>

<style lang="scss" scoped>
.puzzle-directory {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  gap: 2rem;
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.puzzle-button {
  padding: 1rem 3rem;
  background-color: #ddd;
  border: 1px solid #bbb;
  border-radius: 1rem;
  pointer-events: all;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.puzzle-button:hover {
  background-color: #ddf;
}
</style>