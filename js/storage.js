/* =====================================================================
   storage.js — Unified storage abstraction (spec section 83, 56)
   - Small data → localStorage (settings, theme, recent positions)
   - Larger data → IndexedDB (bookmarks, reflections, wird progress, hifz)
   - Migration-safe: existing rafiq-quran-data is preserved and readable
   ===================================================================== */

const MEMORY_FALLBACK = new Map();

function safeLS() {
  try {
    if (typeof localStorage === 'undefined') return null;
    localStorage.setItem('__probe__', '1');
    localStorage.removeItem('__probe__');
    return localStorage;
  } catch { return null; }
}

const ls = safeLS();

export const Storage = {
  /* ============ localStorage helpers ============ */
  get(key, fallback = null) {
    if (!ls) return MEMORY_FALLBACK.get(key) ?? fallback;
    try {
      const raw = ls.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    const str = JSON.stringify(value);
    if (!ls) { MEMORY_FALLBACK.set(key, str); return true; }
    try { ls.setItem(key, str); return true; }
    catch (e) { console.warn('Storage.set failed', e); return false; }
  },
  remove(key) {
    if (!ls) { MEMORY_FALLBACK.delete(key); return; }
    try { ls.removeItem(key); } catch {}
  },
  keys() {
    if (!ls) return Array.from(MEMORY_FALLBACK.keys());
    const out = [];
    for (let i = 0; i < ls.length; i++) out.push(ls.key(i));
    return out;
  },
};

/* ============ IndexedDB for larger datasets ============ */
const DB_NAME = 'rafiq-quran-db';
const DB_VERSION = 1;
const STORES = ['bookmarks', 'reflections', 'favorites', 'wird-progress', 'hifz', 'mistakes', 'tasbeeh'];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB unavailable')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export const IDB = {
  async get(store, id) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(id);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch { return null; }
  },
  async getAll(store) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result ?? []);
        req.onerror = () => reject(req.error);
      });
    } catch { return []; }
  },
  async put(store, value) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(value);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) { console.warn('IDB.put failed', e); return false; }
  },
  async delete(store, id) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch { return false; }
  },
  async clear(store) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch { return false; }
  },
};

/* ============ Export / Import (spec section 57) ============ */
export async function exportAllData() {
  const lsData = {};
  for (const k of Storage.keys()) {
    if (k.startsWith('rafiq-')) lsData[k] = Storage.get(k);
  }
  const idbData = {};
  for (const store of STORES) idbData[store] = await IDB.getAll(store);
  return { version: 1, exportedAt: new Date().toISOString(), ls: lsData, idb: idbData };
}

export async function importAllData(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (data.ls) for (const [k, v] of Object.entries(data.ls)) Storage.set(k, v);
    if (data.idb) {
      for (const store of STORES) {
        if (Array.isArray(data.idb[store])) {
          await IDB.clear(store);
          for (const item of data.idb[store]) await IDB.put(store, item);
        }
      }
    }
    return true;
  } catch (e) {
    console.warn('importAllData failed', e);
    return false;
  }
}
