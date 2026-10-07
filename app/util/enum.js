import { mapKeys } from './object.js';

/**
 * @template T
 * @param {T} template
 * @returns {T} Readonly and without a prototype
 */
export default function enumeration(template) {
  const ret = Object.create(
    null,
    mapKeys(template, value => ({ value }))
  );
  Object.freeze(ret);
  return ret;
}
