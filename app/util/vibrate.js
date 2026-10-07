export function vibrate(durationMillis = 100) {
  if ('vibrate' in navigator) navigator.vibrate(durationMillis);
}