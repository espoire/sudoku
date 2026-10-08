<template>
  <div class="buttonWrap">
    <slot name="special" />
    <div class="buttonBorder">
      <div class="button">
        <span class="buttonText">
          <slot />
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.buttonWrap {
  position: relative;
  border-radius: 0.625em;
  font-size: 8dvmin;
  height: fit-content;
}

.buttonBorder {
  position: relative;
  border: 0.1em solid #fff;
  border-radius: 0.625em;
  background-color: inherit;

  left: 0;
  top: 0;

  transition: 0.2s;
  &:hover:not(:active) {
    left: -0.0625em;
    top: -0.0625em;
    filter: drop-shadow(0.0625em 0.0625em 0 gray);
  }

  pointer-events: var(--pointer-events, all);
  cursor: pointer;

  color: #fff;
  line-height: 1;
  white-space: nowrap;
}

.button {
  background: linear-gradient(transparent, #fff4, transparent 30%, transparent, #0004);

  padding: 0.035em 0.125em 0.25em 0.125em;
  border: 0.0375em solid #0008;
  border-radius: 0.5em;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.buttonText {
  filter: drop-shadow(0.0375em 0.0375em 0 gray);
}
</style>
