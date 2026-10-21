/**
 * Modal Module
 * Opens/closes modals with dynamic content injection.
 */

let currentCloseHandler = null;

/**
 * Open the global modal with given HTML content.
 * @param {string} html — inner HTML for the modal body
 * @param {Function} [onClose] — callback when the modal is closed
 */
export function openModal(html, onClose) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  if (!overlay || !body) return;

  body.innerHTML = html;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  currentCloseHandler = onClose || null;
}

/**
 * Close the global modal.
 */
export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.classList.add('hidden');
  document.body.style.overflow = '';

  if (currentCloseHandler) {
    currentCloseHandler();
    currentCloseHandler = null;
  }
}

/**
 * Initialize modal close handlers.
 */
export function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeModal();
    }
  });
}
