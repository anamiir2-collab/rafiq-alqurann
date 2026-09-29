/* =====================================================================
   router.js — Hash-based router (spec section 67: GitHub Pages compatible)
   No backend, no history API issues on static hosting.
   ===================================================================== */

import { State } from './state.js';

const ROUTES = new Map();
const ROUTE_PARAMS = new Map(); // pattern -> regex + param names
let currentPath = '';
let currentMatch = null;

/* Pre-resolved routes — registered by main app.js */
export function registerRoute(pattern, handler) {
  ROUTES.set(pattern, handler);
  // Convert :param style to regex
  const paramNames = [];
  const regexStr = pattern
    .replace(/\/:([^/]+)/g, (_, p) => { paramNames.push(p); return '/([^/]+)'; })
    .replace(/\//g, '\\/');
  ROUTE_PARAMS.set(pattern, { regex: new RegExp(`^${regexStr}$`), paramNames });
}

export function navigate(path, opts = {}) {
  const hash = `#${path}`;
  if (location.hash === hash && !opts.force) return;
  location.hash = hash;
}

export function getCurrentPath() { return currentPath; }
export function getCurrentMatch() { return currentMatch; }

function parseHash() {
  let hash = location.hash.replace(/^#/, '');
  if (!hash) hash = '/';
  return hash;
}

function matchRoute(path) {
  for (const [pattern, handler] of ROUTES) {
    const { regex, paramNames } = ROUTE_PARAMS.get(pattern);
    const m = regex.exec(path);
    if (m) {
      const params = {};
      paramNames.forEach((n, i) => { params[n] = decodeURIComponent(m[i + 1]); });
      return { pattern, handler, params };
    }
  }
  return null;
}

let lastContainer = null;
async function render() {
  const path = parseHash();
  currentPath = path;
  const match = matchRoute(path);
  currentMatch = match;

  const container = document.getElementById('app');
  if (!container) return;

  // Scroll to top on route change (unless route set ?keepScroll)
  if (!match?.params?.keepScroll) {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  try {
    if (match) {
      await match.handler(container, match.params);
    } else {
      // Fall back to home
      location.hash = '/';
    }
  } catch (e) {
    console.error('Route render failed:', e);
    container.innerHTML = `<div class="container-app" style="padding:48px 16px;text-align:center;color:var(--fg-muted)">
      <p>حدث خطأ غير متوقع.</p>
      <p style="font-size:13px;margin-top:8px">المسار: ${path}</p>
      <button class="btn btn-outline mt-4" onclick="location.hash='/'">العودة للرئيسية</button>
    </div>`;
  }
}

export function startRouter() {
  // Render on every hash change
  window.addEventListener('hashchange', render);
  // Initial render
  render();
}

/* ============ Link helper ============ */
export function link(path) { return `#${path}`; }

/* ============ Navigation helpers ============ */
export function goHome()      { navigate('/'); }
export function goQuran()     { navigate('/quran'); }
export function goSurah(num)  { navigate(`/quran/${num}`); }
export function goWird()      { navigate('/wird'); }
export function goTadabbur()  { navigate('/tadabbur'); }
export function goMore()      { navigate('/more'); }
export function goHifz()      { navigate('/hifz'); }
export function goSettings()  { navigate('/settings'); }
