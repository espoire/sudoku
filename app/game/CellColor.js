export default class CellColor {
  constructor({ id, sortOrder }) {
    this.id = id;
    this.sortOrder = sortOrder;
    Object.freeze(this);
    CellColor.#all.push(this);
  }

  static #all = [];

  static lookup(colorOrId) {
    let color = null;
    if (CellColor.#all.includes(colorOrId)) {
      color = colorOrId; // Is a color object
    } else if (typeof colorOrId === 'string') {
      color = CellColor[colorOrId];
    }

    if (color instanceof CellColor) return color;
    return null;
  }

  static c1 = new CellColor({ id: 'c1', sortOrder: 1 });
  static c2 = new CellColor({ id: 'c2', sortOrder: 2 });
  static c3 = new CellColor({ id: 'c3', sortOrder: 3 });
  static c4 = new CellColor({ id: 'c4', sortOrder: 4 });
  static c5 = new CellColor({ id: 'c5', sortOrder: 5 });
  static c6 = new CellColor({ id: 'c6', sortOrder: 6 });
  static c7 = new CellColor({ id: 'c7', sortOrder: 7 });
  static c8 = new CellColor({ id: 'c8', sortOrder: 8 });
  static c9 = new CellColor({ id: 'c9', sortOrder: 9 });
  static b1 = new CellColor({ id: 'b1', sortOrder: 1.5 });
  static b2 = new CellColor({ id: 'b2', sortOrder: 2.5 });
  static b3 = new CellColor({ id: 'b3', sortOrder: 3.5 });
  static b4 = new CellColor({ id: 'b4', sortOrder: 4.5 });
  static b5 = new CellColor({ id: 'b5', sortOrder: 5.5 });
  static b6 = new CellColor({ id: 'b6', sortOrder: 6.5 });
  static b7 = new CellColor({ id: 'b7', sortOrder: 7.5 });
  static b8 = new CellColor({ id: 'b8', sortOrder: 8.5 });
  static b9 = new CellColor({ id: 'b9', sortOrder: 9.5 });
  static theme = new CellColor({ id: 'theme', sortOrder: 10 });
}

export class CellColorSet {
  #colors = [];

  /** @returns {boolean} Whether the color was successfully added */
  add(colorOrId) {
    const color = CellColor.lookup(colorOrId);
    if (!color) return false;
    if (this.#colors.includes(color)) return false;

    this.#colors.push(color);
    this.#sort();
    return true;
  }

  /** @returns {boolean} Whether the color was successfully removed */
  delete(colorOrId) {
    const index = this.#indexOf(colorOrId);
    if (index === -1) return false;

    this.#colors.splice(index, 1);
    // No need to sort; removal will preserve the invariant
    return true;
  }

  has(colorOrId) {
    const color = CellColor.lookup(colorOrId);
    if (!color) return false;
    return this.#colors.includes(color);
  }

  #indexOf(colorOrId) {
    const color = CellColor.lookup(colorOrId);
    if (!color) return -1;
    return this.#colors.indexOf(color);
  }

  /** @returns {Array<string>} The list of color IDs in sorted order */
  get colors() {
    return this.#colors.map(c => c.id);
  }

  #sort() {
    this.#colors.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}