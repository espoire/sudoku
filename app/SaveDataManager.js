import Settings from "./Settings.js";
import UserSettingsManager from "./UserSettingsManager.js";

export default class SaveDataManager {
  static consoleTextStyle = 'color: #00ff00; font-size: 20px; font-weight: bold;';

  static saveUserSettings() {
    const payload = UserSettingsManager.compress(Settings.user);
    localStorage.setItem('settings', JSON.stringify(payload));
    console.log('%c User settings saved!', SaveDataManager.consoleTextStyle);
  }

  static loadUserSettings() {
    const payload = localStorage.getItem('settings');
    if (payload) Settings.user = UserSettingsManager.loadFrom(JSON.parse(payload));
  }
}