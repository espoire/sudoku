import { environmentIsDev } from "./Util.js";

if (environmentIsDev()) {
  window.expose = function expose(key, value) {
    if (value === undefined) {
      value = key;
      key = 'exposed';
    }
  
    console.log(`Exposing to global scope: window.${key} =`);
    console.log(value);
  
    window[key] = value;
  };
} else {
  window.expose = () => {};
}
