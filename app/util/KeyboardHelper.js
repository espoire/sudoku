const keys = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
};

export default class KeyboardHelper {
  static isLeft(event) {
    return keys.left.includes(event.key);
  }
  static isRight(event) {
    return keys.right.includes(event.key);
  }
  static isUp(event) {
    return keys.up.includes(event.key);
  }
  static isDown(event) {
    return keys.down.includes(event.key);
  }
}