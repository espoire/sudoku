import { first } from "../../../util/Array.js";
import { randBool, randomArrayElement } from "../../../util/random.js";
import { capitalize } from "../../../util/string.js";

const vowels = ['a', 'e', 'i', 'o', 'u', 'x'];
const adjectives = ['aardvark', 'abstract', 'apple', 'analytic', 'arcane', 'awesome', 'ancient', 'banana', 'big', 'bogus', 'brainy', 'brooding', 'cerebral', 'cherry', 'colossal', 'choice', 'clandestine', 'cool', 'cryptic', 'curious', 'date', 'dank', 'destined', 'elderberry', 'endless', 'embodied', 'epic', 'exotic', 'esoteric', 'enigmatic', 'fig', 'fantastic', 'first', 'grape', 'giant', 'great', 'good', 'highbrow', 'honeydew', 'huge', 'iris', 'indecent', 'inscrutable', 'imperishable', 'impossible', 'intriguing', 'juice', 'jungle', 'kiwi', 'kingly', 'lemon', 'large', 'lowbrow', 'lovely', 'legit', 'lean', 'legendary', 'mango', 'massive', 'meditations on', 'monkey', 'mysterious', 'nectarine', 'null', 'neat', 'number', 'numeric', 'orange', 'okay', 'oversized', 'ominous', 'ordained', 'papaya', 'perfect', 'primo', 'ponderous', 'quince', 'queried', 'raspberry', 'reflective', 'ruminant', 'strawberry', 'straight', 'scarlet', 'second', 'secret', 'subterranean', 'sus', 'tangerine', 'tall', 'talented', 'tenth', 'tenacious', 'thinky', 'ugly', 'undefined', 'unfathomed', 'ultimate', 'vanilla', 'verifiable', 'watermelon', 'whimsical', 'wily', 'xray', 'yam', 'zucchini', 'zany'];
const nouns = ['advice', 'adventure', 'array', 'animism', 'ballet', 'box', 'boggle', 'boogie', 'blossom', 'business', 'caper', 'chess', 'chase', 'choice', 'conundrum', 'dilemma', 'doubt', 'dance', 'devil', 'detour', 'entrancement', 'evening', 'epic', 'find', 'frenzy', 'frolic', 'guess', 'galavant', 'geometry', 'graveyard', 'grid', 'hide', 'hearsay', 'incident', 'jape', 'japes', 'journey', 'key', 'look', 'laughs', 'letter', 'list', 'madness', 'marquee', 'masquerade', 'matrix', 'mixer', 'mystery', 'mysticism', 'night', 'novel', 'opinion', 'order', 'object', 'olive', 'overture', 'puzzle', 'panic', 'picture', 'poetry', 'prance', 'quest', 'query', 'riddle', 'riot', 'romp', 'story', 'song', 'spell', 'soiree', 'tale', 'tango', 'trek', 'tour', 'tiles', 'twist', 'utterance', 'view', 'voyage', 'waltz', 'whirl', 'whim', 'whimsy', 'wilderness', 'yarn', 'zeal'];

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