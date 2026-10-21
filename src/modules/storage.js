/**
 * Storage Module — LocalStorage persistence layer
 * Handles all read/write operations for heroes, missions, events, preferences.
 */

const STORAGE_KEYS = {
  HEROES: 'avengers_heroes',
  MISSIONS: 'avengers_missions',
  EVENTS: 'avengers_events',
  PREFERENCES: 'avengers_prefs',
  GOOGLE_TOKEN: 'avengers_gtoken',
  GOOGLE_CREDENTIALS: 'avengers_gcredentials',
  SOUND_ENABLED: 'avengers_sound_enabled',
};

/**
 * Save data to localStorage under a given key.
 * @param {string} key
 * @param {*} data
 */
export function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[Storage] Failed to save key "${key}":`, err);
  }
}

/**
 * Load data from localStorage.
 * @param {string} key
 * @param {*} fallback — default value if nothing stored
 * @returns {*}
 */
export function loadData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`[Storage] Failed to load key "${key}":`, err);
    return fallback;
  }
}

/**
 * Remove a key from localStorage.
 */
export function removeData(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[Storage] Failed to remove key "${key}":`, err);
  }
}

export { STORAGE_KEYS };
