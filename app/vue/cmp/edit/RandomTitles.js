import { first } from "../../../util/Array.js";
import { randBool, randomArrayElement } from "../../../util/random.js";
import { capitalize } from "../../../util/string.js";

const vowels = ['a', 'e', 'i', 'o', 'u', 'x'];
const adjectives = ['aardvark', 'apple', 'awesome', 'banana', 'big', 'bogus', 'cherry', 'colossal', 'choice', 'cool', 'cryptic', 'date', 'dank', 'elderberry', 'endless', 'embodied', 'epic', 'fig', 'fantastic', 'first', 'grape', 'giant', 'great', 'good', 'honeydew', 'huge', 'iris', 'indecent', 'imperishable', 'impossible', 'juice', 'jungle', 'kiwi', 'kingly', 'lemon', 'large', 'lovely', 'legit', 'lean', 'mango', 'massive', 'monkey', 'nectarine', 'null', 'neat', 'number', 'numeric', 'orange', 'okay', 'oversized', 'papaya', 'perfect', 'primo', 'quince', 'raspberry', 'strawberry', 'straight', 'scarlet', 'second', 'subterranean', 'sus', 'tangerine', 'tall', 'talented', 'tenth', 'ugly', 'undefined', 'ultimate', 'vanilla', 'verifiable', 'watermelon', 'whimsical', 'wily', 'xray', 'yam', 'zucchini', 'zany'];
const nouns = ['advice', 'adventure', 'array', 'animism', 'box', 'boggle', 'blossom', 'business', 'chess', 'chase', 'choice', 'doubt', 'dance', 'devil', 'detour', 'entrancement', 'evening', 'epic', 'find', 'frenzy', 'guess', 'galavant', 'geometry', 'graveyard', 'grid', 'hide', 'hearsay', 'incident', 'jape', 'japes', 'journey', 'key', 'look', 'laughs', 'letter', 'list', 'madness', 'marquee', 'masquerade', 'matrix', 'mystery', 'mysticism', 'night', 'novel', 'opinion', 'order', 'object', 'olive', 'overture', 'puzzle', 'panic', 'picture', 'poetry', 'quest', 'query', 'riddle', 'riot', 'romp', 'story', 'song', 'spell', 'soiree', 'tale', 'trek', 'tour', 'tiles', 'utterance', 'view', 'voyage', 'waltz', 'whirl', 'whim', 'whimsy', 'wilderness', 'yarn', 'zeal'];

export default class RandomTitles {
  static words = [];

  static pickNew() {
    RandomTitles.words = [
      randomArrayElement(adjectives),
      randomArrayElement(nouns),
    ];
    if (randBool(0.5)) {
      const firstLetter = first(RandomTitles.words)[0];
      RandomTitles.words.unshift(randomArrayElement([vowels.includes(firstLetter) ? 'an' : 'a', 'the']));
    }
  }

  static getTitle() {
    return RandomTitles.words.map(capitalize).join(' ');
  }

  static getId() {
    return RandomTitles.words.join('-');
  }
}