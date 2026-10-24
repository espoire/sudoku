import PuzzlePlayInteractor from "../game/board/PuzzlePlayInteractor.js";
// import PuzzleEditInteractor from "./game/board/PuzzleEditInteractor.js";
import Settings from "../Settings.js";
import { trimObject } from "./util.js";
import UserSettingsManager from "../UserSettingsManager.js";

export default class SaveDataManager {
  static consoleTextStyle = 'color: #00ff00; font-size: 20px; font-weight: bold;';

  static saveUserSettings() {
    const payload = UserSettingsManager.compress(Settings.user);
    localStorage.setItem('settings', JSON.stringify(payload));
    console.log('%c User settings saved!', SaveDataManager.consoleTextStyle);
  }

  static loadUserSettings() {
    const payload = localStorage.getItem('settings');
    if (payload) UserSettingsManager.loadFrom(JSON.parse(payload));
  }

  static hasSavedGame() {
    return localStorage.getItem('continue') != null;
  }

  static saveGameState(interactor) {
    const payload = interactor.toSaveDataObject();
    trimObject(payload);
    localStorage.setItem('continue', JSON.stringify(payload));
    console.log('%c Game state saved!', SaveDataManager.consoleTextStyle);
  }

  static loadGameState() {
    const payload = localStorage.getItem('continue');
    if (payload) return PuzzlePlayInteractor.rehydrate(JSON.parse(payload));
    return null;
  }

  // TODO

  // static saveEditState(interactor) {
  //   const payload = interactor.toSaveDataObject();
  //   localStorage.setItem('editing', JSON.stringify(payload));
  //   console.log('%c Edit state saved!', SaveDataManager.consoleTextStyle);
  // }

  // static loadEditState() {
  //   const payload = localStorage.getItem('editing');
  //   if (payload) PuzzleEditInteractor.rehydrate(JSON.parse(payload));
  // }
}