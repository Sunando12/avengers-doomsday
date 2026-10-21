/**
 * Toast Notification Module
 * Provides lightweight, animated toast notifications.
 */

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const DEFAULT_DURATION = 3500;

/**
 * Show a toast notification.
 * @param {string} message - The toast message
 * @param {'success'|'error'|'warning'|'info'} type - The toast variant
 * @param {number} duration - Auto-dismiss time in ms
 */
export function showToast(message, type = 'info', duration = DEFAULT_DURATION) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);

  // Auto-dismiss
  const timer = setTimeout(() => dismissToast(toast), duration);

  // Click to dismiss
  toast.addEventListener('click', () => {
    clearTimeout(timer);
    dismissToast(toast);
  });
}

function dismissToast(toast) {
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}
