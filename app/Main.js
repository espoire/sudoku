import './util/expose.js';
import './VueMain.js';
import Globals from './Globals.js';
import { environmentIsDev } from './util/Util.js';
import GameController from './game/GameController.js';
import { runTests } from '../test/TestRunner.js';

if (environmentIsDev()) runTests();

const game = new GameController();
initGlobals(game);
setTimeout(() => game.begin()); // Delay to allow initial rendering, component mounting, etc.

function initGlobals(game) {
  Globals.gameController = game;
}