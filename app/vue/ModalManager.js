import Settings from '../Settings.js';
import { last, lastIndexWhere } from '../util/Array.js';
import { capitalize } from '../util/string.js';
import { errorOrThrow, warnOrThrow } from '../util/Util.js';

/**
 * Allows Vue.js components (or other UIs, say, in a canvas)
 * to register/deregister themselves as accepting input, and
 * then auto-routes keyboard/gamepad events ONLY to the most-
 * recently-registered component.
 */
export default class ModalManager {
  /** @type {Array<{ name: string, events: Record<string, Function> }>} */
  static #modalStack = [];

  static #managedEvents = ['keydown']; // For future expansion into gamepad events
  static #initialized = false;

  /**
   * @param {string} name The name of the modal, for logging/debug purposes
   * @param {Record<string, Function>} events An object mapping event names to their handlers
   */
  static register(name, events) {
    if (typeof name !== 'string') warnOrThrow('ModalManager:push name must be a string');
    if (typeof events !== 'object') warnOrThrow('ModalManager:push events must be an object');

    ModalManager.#modalStack.push({ name, events });
  }

  /**
   * Removes the LAST registered modal with the given name.
   * Throws in dev if no such modal is found.
   * 
   * @param {string} name The name of the modal to unregister (as set when registering)
   */
  static unregister(name) {
    // Unregister by name to avoid control issues caused by the old push/pop model when
    // a UI mode swap mounts the new UI before unmounting the old one. *shakes fist at Vue.js*
    // Still remove last matching modal to allow for nested modals of the same kind.

    const lastMatchIndex = lastIndexWhere(
      ModalManager.#modalStack,
      m => m.name === name
    );

    if (lastMatchIndex == null) warnOrThrow(`ModalManager:unregister could not find modal with name "${name}" to unregister.`);

    ModalManager.#modalStack.splice(lastMatchIndex, 1);
  }

  static init() {
    if (ModalManager.#initialized) return;
    ModalManager.#initialized = true;

    if (!window?.addEventListener)
      return errorOrThrow('ModalManager:init window.addEventListener is not supported');

    for (const eventType of ModalManager.#managedEvents) {
      const methodName = 'on' + capitalize(eventType);

      const method = function (event) {
        if (!ModalManager.#modalStack?.length) return; // No registered listeners

        const topModal = last(ModalManager.#modalStack);
        if (typeof topModal?.events?.[methodName] === 'function') {
          _log(`Relaying event '${eventType}' to modal ${nameOf(topModal)}.`);
          topModal.events[methodName](event);
        } else {
          _log(`No handler for ${methodName} in modal ${nameOf(topModal)}.`);
        }
      };

      Object.defineProperty(method, 'name', { value: methodName });
      ModalManager[methodName] = method;
      window.addEventListener(eventType, ModalManager[methodName]);
    }

    // Example:
    // static onKeydown(event) {
    //   const topModal = last(ModalManager.#modalStack);
    //   if (typeof topModal?.onKeydown === 'function') topModal.onKeydown(event);
    // }
  }
}

ModalManager.init();

/**
 * @param {{ name: string, events: Record<string, Function> }} modal
 * @returns {string} The name of the modal, or a default name if not provided
 */
function nameOf(modal) {
  if (modal == null) return 'null';
  return modal.name ?? '[no name]';
}

function _log(...messages) {
  if (Settings.test?.log?.modalEventRouting) console.log('ModalManager: ', ...messages);
}
