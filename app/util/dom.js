/**
 * @param {HTMLElement} parentEl
 * @returns {{ x: number, y: number }}
 */
export function getParentSize(parentEl) {
  if (parentEl != null)
    return {
      x: parentEl.clientWidth,
      y: parentEl.clientHeight,
    };

  return {
    x: window.innerWidth,
    y: window.innerHeight,
  };
}
