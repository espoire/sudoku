export function getLinearGradientFromColors(colorIds) {
  if (!colorIds || colorIds.length === 0) return null;

  const step = 100 / colorIds.length;
  const gradientParts = colorIds.map((color, index) => {
    const start = index * step;
    const end = start + step;
    return `var(--user-color-${color}) ${start.toFixed(1)}% ${end.toFixed(1)}%`;
  });

  return `linear-gradient(180deg, ${gradientParts.join(', ')})`;
}