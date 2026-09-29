/* =====================================================================
   toast.js — Toast notifications (spec section 61)
   Reusable; replaces the legacy global toast() function.
   ===================================================================== */

let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  return container;
}

export function toast(message, type = 'info', duration = 3000) {
  const c = ensureContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  c.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// Make available globally for legacy code
window.toast = toast;
