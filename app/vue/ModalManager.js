import Settings from '../Settings.js';
import { last, lastIndexWhere } from '../util/Array.js';
import { capitalize } from '../util/string.js';
import { errorOrThrow, warnOrThrow } from '../util/Util.js';

/** @typedef {{ name: string, events: Record<string, Function> }} ModalRegistration */

/**
 * Allows Vue.js components (or other UIs, say, in a canvas)
 * to register/deregister themselves as accepting input, and
 * then auto-routes keyboard/gamepad events ONLY to the most-
 * recently-registered component.
 */
export default class ModalManager {
  /**
   * @type {Array<ModalRegistration | Array<ModalRegistration>>}
   * Zero or more modals or arrays of peer modals.
   * Events are routed to the top item of the outermost array (the most recent modal in the stack), or all peers if the top item is an array.
   */
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

  static registerPeer(peerName, name, events) {
    if (typeof peerName !== 'string') warnOrThrow('ModalManager:registerPeer peerName must be a string');
    if (typeof name !== 'string') warnOrThrow('ModalManager:registerPeer name must be a string');
    if (typeof events !== 'object') warnOrThrow('ModalManager:registerPeer events must be an object');

    if (!ModalManager.isOnTop(peerName)) warnOrThrow(`ModalManager:registerPeer peer with name "${peerName}" is not on top of the stack`);

    const topOfStack = last(ModalManager.#modalStack);
    const newItem = { name, events };

    if (Array.isArray(topOfStack)) {
      // Add into existing peer group

      topOfStack.push(newItem);
      return;

    } else {
      // Convert to new peer group

      // Remove old top of stack
      ModalManager.#modalStack.pop();
      
      // Insert new peer array containing old item & new item
      const peers = [topOfStack, newItem];
      ModalManager.#modalStack.push(peers);
    }
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
      m => (
        Array.isArray(m) ?
          m.some(peer => peer.name === name) :
          m.name === name
      )
    );

    if (lastMatchIndex == null) warnOrThrow(`ModalManager:unregister could not find modal with name "${name}" to unregister.`);

    const match = ModalManager.#modalStack[lastMatchIndex];
    if (Array.isArray(match)) {
      const subIndex = lastIndexWhere(match, peer => peer.name === name);
      if (subIndex !== -1) match.splice(subIndex, 1);

      // If this leaves an empty peer group, remove the group too
      if (match.length === 0) ModalManager.#modalStack.splice(lastMatchIndex, 1);

    } else {
      ModalManager.#modalStack.splice(lastMatchIndex, 1);
    }
  }

  /**
   * Checks if the modal with the given name is currently on top of the modal stack.
   * @param {string} name The name of the modal to check
   * @returns {boolean} True if the modal is on top, false otherwise
   */
  static isOnTop(name) {
    const topModal = last(ModalManager.#modalStack);
    if (Array.isArray(topModal)) {
      return topModal.some(peer => peer.name === name);
    } else {
      return topModal?.name === name;
    }
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
        if (Array.isArray(topModal))  {
          const peers = topModal;

          for (const peer of peers) {
            const relay = ModalManager.#relayEvent(peer, event, eventType, methodName);
            if (!relay) {
              _log(`Event '${eventType}' propagation stopped by modal ${nameOf(peer)}.`);
              break;
            }
          }

        } else {
          ModalManager.#relayEvent(topModal, event, eventType, methodName);
        }
      };

      Object.defineProperty(method, 'name', { value: methodName });
      ModalManager[methodName] = method;
      window.addEventListener(eventType, ModalManager[methodName]);
    }

    // Example:
    // static onKeydown(event) {
    //   const topModal = last(ModalManager.#modalStack);
    //   if (Array.isArray(topModal)) for (const peer of topModal) {
    //     if (typeof peer?.events?.onKeydown === 'function') peer.events.onKeydown(event);
    //   } else {
    //     if (typeof topModal?.events?.onKeydown === 'function') topModal.events.onKeydown(event);
    //   }
    // }
  }

  static #relayEvent(targetModal, event, eventType, methodName) {
    let propagateToPeers = true;
    
    if (typeof targetModal?.events?.[methodName] === 'function') {
      _log(`Relaying event '${eventType}' to modal ${nameOf(targetModal)}.`);
      if (targetModal.events[methodName](event) === false) propagateToPeers = false;
    } else {
      _log(`No handler for ${methodName} in modal ${nameOf(targetModal)}.`);
    }

    return propagateToPeers;
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