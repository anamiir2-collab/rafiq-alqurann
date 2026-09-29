/* =====================================================================
   bottom-sheet.js — Reusable bottom sheet (spec section 15, 61)
   Word tap, ayah actions, reciter picker, etc.
   ===================================================================== */

let activeSheet = null;

export function openSheet({ title = '', subtitle = '', body = '', actions = [] } = {}) {
  closeSheet(true);

  const backdrop = document.createElement('div');
  backdrop.className = 'bottom-sheet-backdrop';
  backdrop.addEventListener('click', () => closeSheet());

  const sheet = document.createElement('div');
  sheet.className = 'bottom-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');

  sheet.innerHTML = `
    <div class="sheet-header">
      ${title ? `<div class="sheet-title">${title}</div>` : ''}
      ${subtitle ? `<div class="sheet-subtitle">${subtitle}</div>` : ''}
    </div>
    <div class="sheet-body">${body}</div>
    ${actions.length ? `
      <div class="sheet-actions">
        ${actions.map(a => `
          <button class="sheet-action ${a.active ? 'active' : ''}" data-action="${a.id}" aria-label="${a.label}">
            ${a.icon}
            <span>${a.label}</span>
          </button>
        `).join('')}
      </div>
    ` : ''}
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(sheet);

  // Animate in
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    sheet.classList.add('open');
  });

  // Wire up action buttons
  sheet.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-action');
      const action = actions.find(a => a.id === id);
      if (action && typeof action.onClick === 'function') {
        const result = action.onClick();
        if (result !== false) closeSheet();
      }
    });
  });

  // Escape to close (spec section 95: Keyboard)
  const escHandler = (e) => {
    if (e.key === 'Escape') { closeSheet(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  activeSheet = { backdrop, sheet, escHandler };
  return activeSheet;
}

export function closeSheet(immediate = false) {
  if (!activeSheet) return;
  const { backdrop, sheet, escHandler } = activeSheet;
  document.removeEventListener('keydown', escHandler);

  if (immediate) {
    backdrop.remove();
    sheet.remove();
    activeSheet = null;
    return;
  }

  backdrop.classList.remove('open');
  sheet.classList.remove('open');
  setTimeout(() => {
    backdrop.remove();
    sheet.remove();
    if (activeSheet && activeSheet.sheet === sheet) activeSheet = null;
  }, 420);
}

export function isSheetOpen() { return activeSheet !== null; }
