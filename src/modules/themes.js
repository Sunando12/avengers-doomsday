/**
 * Theme Module
 * Handles theme switching, persistence, and dropdown UI.
 */

import { saveData, loadData, STORAGE_KEYS } from './storage.js';

const THEMES = ['doomsday', 'infinity', 'multiverse', 'stark', 'asgard'];

/**
 * Initialize the theme system.
 */
export function initThemes() {
  // Load saved theme
  const prefs = loadData(STORAGE_KEYS.PREFERENCES, {});
  const savedTheme = prefs.theme || 'doomsday';
  applyTheme(savedTheme);

  // Toggle button
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const dropdown = document.getElementById('theme-dropdown');
  if (toggleBtn && dropdown) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      dropdown.classList.add('hidden');
    });
    dropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  // Theme option buttons
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      applyTheme(theme);
      // Save preference
      const prefs = loadData(STORAGE_KEYS.PREFERENCES, {});
      prefs.theme = theme;
      saveData(STORAGE_KEYS.PREFERENCES, prefs);
      // Update active class
      document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Close dropdown
      if (dropdown) dropdown.classList.add('hidden');
    });
  });
}

/**
 * Apply a theme to the document.
 * @param {string} theme
 */
function applyTheme(theme) {
  if (!THEMES.includes(theme)) theme = 'doomsday';
  document.documentElement.setAttribute('data-theme', theme);
  // Update active option button
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}
