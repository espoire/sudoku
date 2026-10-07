const keys = {
  left: ['ArrowLeft', 'a', 'A', '4'],
  right: ['ArrowRight', 'd', 'D', '6'],
  up: ['ArrowUp', 'w', 'W', '8'],
  down: ['ArrowDown', 's', 'S', '2'],
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