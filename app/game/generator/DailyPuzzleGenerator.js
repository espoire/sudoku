import { SeededRandomGenerator } from "../../util/random.js";

export default class DailyPuzzleGenerator {
  static getSeed() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Months are zero-based
    const day = now.getDate();
    return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
  }

  static generate(seed = DailyPuzzleGenerator.getSeed()) {
    const random = new SeededRandomGenerator(seed);
  }
}