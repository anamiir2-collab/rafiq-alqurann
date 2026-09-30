/* =====================================================================
   bottom-nav.js — 5-item bottom navigation (spec section 22)
   الرئيسية / القرآن / الورد / التدبر / المزيد
   ===================================================================== */

import { Icons } from './icons.js';
import { navigate, getCurrentPath } from '../js/router.js';

const NAV_ITEMS = [
  { path: '/',            label: 'الرئيسية', icon: Icons.home,    color: 'quran' },
  { path: '/quran',       label: 'القرآن',   icon: Icons.quran,   color: 'quran' },
  { path: '/tadabbur',    label: 'التدبر',   icon: Icons.reflect, color: 'tadabbur' },
  { path: '/more/favorites', label: 'المحفوظات', icon: Icons.bookmark, color: 'wird' },
  { path: '/more',        label: 'المزيد',   icon: Icons.more,    color: 'more' },
];

export function renderBottomNav() {
  const current = getCurrentPath() || '/';
  const items = NAV_ITEMS.map(item => {
    let active = false;
    if (item.path === '/') active = current === '/' || current === '';
    else active = current === item.path || current.startsWith(item.path + '/');
    return `
      <button
        class="nav-btn ${active ? 'active' : ''}"
        data-color="${item.color}"
        onclick="window.__nav('${item.path}')"
        aria-label="${item.label}"
        aria-current="${active ? 'page' : 'false'}"
      >
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </button>
    `;
  }).join('');

  return `
    <nav class="bottomnav" role="navigation" aria-label="التنقل الرئيسي">
      <div class="bottomnav-inner">${items}</div>
    </nav>
  `;
}

/* Expose for inline onclick handlers (works with ES modules without window pollution) */
window.__nav = (path) => navigate(path);
