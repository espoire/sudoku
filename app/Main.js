import './util/expose.js';
import './VueMain.js';
import Globals from './Globals.js';
import { environmentIsDev } from './util/Util.js';
import GameController from './game/GameController.js';
import { runTests } from '../test/TestRunner.js';
import SaveDataManager from './save/SaveDataManager.js';
import GlobalVueProps from './VueInterface.js';
import Settings from './Settings.js';

if (environmentIsDev()) runTests();

const game = new GameController();
initGlobals(game);

SaveDataManager.loadUserSettings();
GlobalVueProps.palette = Settings.user.userHighlightPalette;

setTimeout(() => game.begin()); // Delay to allow initial rendering, component mounting, etc.

function initGlobals(game) {
  Globals.gameController = game;
}