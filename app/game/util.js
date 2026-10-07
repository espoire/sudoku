// This app/game/util.js file contains game-specific utility functions
// inappropriate for the app/util directory, which should contain only
// general-purpose utility functions potentially useful in other projects.

import Constants from '../Constants.js';
import Globals from '../Globals.js';
import { removeDuplicates } from '../util/Array.js';
import { deepClone, deepEquals } from '../util/object.js';
import { warnInDev } from '../util/Util.js';

/**
 * @param {{byPlayerStartElement?: {[x: string]: *}, [x: string]: *}} config
 * @returns {{[x: string]: *}?} A deep clone of the config with the byPlayerStartElement property deparameterized, if it was present.
 */
export function deparameterizeByPlayerStartElement(config, element = null) {
  if (config == null) return null;

  config = deepClone(config); // deepClone to avoid modifying the original config

  if (!config.byPlayerStartElement) return config;

  let playerElement = element ?? Globals.player?.starterElement;
  if (!playerElement) {
    warnInDev(
      'Attempted to deparameterize byPlayerStartElement before player element set to anything!'
    );
    playerElement = Constants.element.defaultPlayerElement;
  }

  const ret = {
    ...config,
    ...config.byPlayerStartElement[playerElement],
  };
  delete ret.byPlayerStartElement;
  return ret;
}

/**
 * Splits a parameterized config into an array of configs, one per parameterization.
 * @param {object} config
 * @returns {object[]}
 */
export function deparameterizeFork(config, parameterizations = ['byPlayerStartElement']) {
  if (config == null) return null;

  config = deepClone(config); // deepClone to avoid modifying the original config

  const forks = [config];

  // Iterate over each parameterizable key (e.g. byPlayerStartElement, etc.)
  for (const parameterization of parameterizations) {

    // Iterate over each fork created so far (just the original config on the first pass)
    for (let i = 0; i < forks.length; i++) {
      const fork = forks[i];
      if (!fork[parameterization]) continue;

      // Get the unique branches for this parameterization
      // E.G. byPlayerElement { fire: { id: 'aqua-imp' }, water: { id: 'bubble-dragon' }, leaf: { id: 'bubble-dragon' } }
      // would unpack into two branches: { id: 'aqua-imp' } and { id: 'bubble-dragon' }
      const rawBranches = Object.values(fork[parameterization]);
      const branches = removeDuplicates(rawBranches, deepEquals);

      const newForks = [];
      for (const paramConfig of branches) {
        // Create a new fork for each branch, merging in the branch config
        const newFork = {
          ...fork,
          ...paramConfig,
        };

        // Remove the parameterization property
        delete newFork[parameterization];
        newForks.push(newFork);
      }

      // Replace the current fork with the new forks
      forks.splice(i, 1, ...newForks);

      // Adjust the index to skip over the newly added forks
      i += newForks.length - 1;
    }
  }

  return forks;
}

export function invertValence(valence) {
  if (valence === 'help') return 'harm';
  else if (valence === 'harm') return 'help';
  return valence;
}
