/* =====================================================================
   state.js — Lightweight observable state (spec section 82)
   Slices: quran, audio, user, settings, wird, hifz, adhkar
   ===================================================================== */

import { Storage } from './storage.js';

const SLICES = ['quran', 'audio', 'user', 'settings', 'wird', 'hifz', 'adhkar'];

const DEFAULT_STATE = {
  quran: {
    lastSurah: 1,
    lastAyah: 1,
    fontSize: 26,        // px
    lineHeight: 2.15,
    showTajweed: false,
    showWaqf: true,
    reciter: 'ar.minshawi',
  },
  audio: {
    current: null,        // { surah, ayah }
    isPlaying: false,
    queue: [],            // [{surah, ayah}]
    queueIndex: 0,
    repeat: 'off',        // 'off' | 'one' | 'all'
    speed: 1,
    autoplay: true,
    lastPosition: null,   // { surah, ayah, currentTime }
  },
  user: {
    name: '',
    level: 'intermediate',  // beginner | intermediate | advanced
    onboarded: false,
  },
  settings: {
    theme: 'system',      // light | dark | system
    notifications: { prayer: false, wird: false, morningAdhkar: false, eveningAdhkar: false },
  },
  wird: {
    activePlanId: null,
    plans: [],            // [{ id, type, target, startDate, progress }]
  },
  hifz: null,             // migrated legacy hifz state on first load
  adhkar: {
    lastCategories: [],
  },
};

const listeners = new Set();
let state = loadState();

function loadState() {
  const stored = Storage.get('rafiq-state', null);
  if (stored && typeof stored === 'object') {
    return deepMerge(structuredClone(DEFAULT_STATE), stored);
  }
  return structuredClone(DEFAULT_STATE);
}

function deepMerge(base, patch) {
  if (Array.isArray(base)) return patch ?? base;
  if (typeof base === 'object' && base !== null) {
    const out = { ...base };
    for (const k of Object.keys(patch ?? {})) {
      if (k in base) out[k] = deepMerge(base[k], patch[k]);
      else out[k] = patch[k];
    }
    return out;
  }
  return patch ?? base;
}

function persist() {
  Storage.set('rafiq-state', state);
}

/* ============ Public API ============ */
export const State = {
  get() { return state; },

  getSlice(name) { return state[name]; },

  setSlice(name, patch) {
    if (!(name in state)) throw new Error(`Unknown state slice: ${name}`);
    state[name] = deepMerge(state[name] ?? {}, patch);
    persist();
    notify(name);
  },

  replaceSlice(name, value) {
    if (!(name in state)) throw new Error(`Unknown state slice: ${name}`);
    state[name] = value;
    persist();
    notify(name);
  },

  subscribe(sliceName, fn) {
    const wrapped = (s) => { if (s === sliceName || s === '*') fn(state[sliceName]); };
    listeners.add(wrapped);
    return () => listeners.delete(wrapped);
  },

  subscribeAll(fn) {
    const wrapped = (s) => fn(state, s);
    listeners.add(wrapped);
    return () => listeners.delete(wrapped);
  },

  reset() {
    state = structuredClone(DEFAULT_STATE);
    persist();
    notify('*');
  },
};

function notify(sliceName) {
  for (const fn of listeners) fn(sliceName);
}

/* ============ Theme bootstrap ============ */
export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark', 'theme-system');
  root.classList.add(`theme-${theme || 'system'}`);

  // Update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    meta.setAttribute('content', isDark ? '#14181F' : '#FAF9F7');
  }
}

/* Apply on load */
applyTheme(state.settings.theme);

/* React to system changes when in 'system' mode */
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (State.getSlice('settings').theme === 'system') applyTheme('system');
  });
}
