/* eslint-disable no-unused-vars */ // Because this is a dev tools file, functions not used in production.

/** Recursively searches a POJO or Array for key-names and data elements matching a provided search target.
 * Helpful if you know what data is in a location you want to find in a deeply-nested JS data structure of unknown shape.
 *
 * Uses breadth-first search, and won't visit the same object twice (e.g. if it's referenced in multiple places or circularly).
 *
 * @param {object | Array} obj
 * @param {*} searchTarget
 * @returns {Set<string>} A set of routes into the root object which terminate in the search target either as a key, or as the value at that key.
 */
function search(obj, searchTarget) {
  const alreadySearched = new Set();
  const toSearch = new Set();
  const foundAt = new Set();

  toSearch.add({
    value: obj,
    route: 'root',
  });

  while (toSearch.size > 0) {
    const entry = toSearch.values().next().value;
    toSearch.delete(entry);

    const { value, route } = entry;

    if (value === searchTarget) {
      foundAt.add(route);
      continue;
    }

    if (Array.isArray(value) && !alreadySearched.has(value)) {
      alreadySearched.add(value);

      for (let i = 0; i < value.length; i++) {
        const subroute = `${route}[${i}]`;
        toSearch.add({
          value: value[i],
          route: subroute,
        });
      }
    } else if (typeof value === 'object' && !alreadySearched.has(value)) {
      alreadySearched.add(value);

      for (const key in value) {
        const subroute = `${route}.${key}`;
        toSearch.add({
          value: value[key],
          route: subroute,
        });

        if (key == searchTarget) {
          foundAt.add(subroute);
        }
      }
    }
  }

  return foundAt;
}

/**
 * Intended for simplifying the debugging of Proxy objects -- makes no promises about the result's mutability, handling of circular references, handling weird types, etc.
 * @param {*} value
 * @returns The non-proxied version of the value.
 */
function unproxy(value) {
  if (value == null || typeof value !== 'object') {
    return value; // Return primitive values as-is
  }

  if (Array.isArray(value)) {
    return value.map(unproxy); // Handle arrays recursively
  }

  const result = {};
  for (const key of Reflect.ownKeys(value)) {
    result[key] = unproxy(Reflect.get(value, key));
  }
  return result;
}