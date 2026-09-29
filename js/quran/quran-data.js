/* =====================================================================
   quran-data.js — Loads & verifies the Quran JSON dataset (spec section 73)
   Source: /data/quran/quran.json + /data/quran/surahs.json
   Spec section 12: "يجب أن يكون القرآن منفصلًا عن UI"
   Spec section 73: Runtime integrity check (114 surahs, no dups, no missing)
   ===================================================================== */

import { Storage } from '../storage.js';

const CACHE_KEY = 'rafiq-quran-cache-v1';
const SURAH_URL = 'data/quran/surahs.json';
const QURAN_URL = 'data/quran/quran.json';

let surahs = null;        // array of 114 surah metadata
let quranText = null;     // { "1": {"1":"...", "2":"..."}, ... }
let loadPromise = null;

export async function loadQuran() {
  if (surahs && quranText) return { surahs, quranText };
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    // Try cache first (offline support — spec section 31)
    const cached = Storage.get(CACHE_KEY, null);
    if (cached && cached.surahs && cached.quranText && cached.surahs.length === 114) {
      surahs = cached.surahs;
      quranText = cached.quranText;
      return { surahs, quranText };
    }

    // Fetch from JSON
    const [surahsRes, quranRes] = await Promise.all([
      fetch(SURAH_URL),
      fetch(QURAN_URL),
    ]);
    if (!surahsRes.ok || !quranRes.ok) {
      throw new Error(`Failed to load Quran dataset (${surahsRes.status}/${quranRes.status})`);
    }
    surahs = await surahsRes.json();
    quranText = await quranRes.json();

    // Runtime integrity check (spec section 73)
    const issues = verifyIntegrity(surahs, quranText);
    if (issues.length > 0) {
      console.error('Quran dataset integrity issues:', issues);
      throw new Error(`Quran integrity check failed: ${issues[0]}`);
    }

    // Cache
    try {
      Storage.set(CACHE_KEY, { surahs, quranText, cachedAt: Date.now() });
    } catch (e) {
      console.warn('Quran cache write failed (probably quota):', e);
    }

    return { surahs, quranText };
  })();
  return loadPromise;
}

export function verifyIntegrity(surahList, text) {
  const issues = [];
  if (!Array.isArray(surahList) || surahList.length !== 114) {
    issues.push(`Expected 114 surahs, got ${Array.isArray(surahList) ? surahList.length : 'non-array'}`);
    return issues;
  }
  const seen = new Set();
  for (const s of surahList) {
    if (typeof s.number !== 'number' || s.number < 1 || s.number > 114) {
      issues.push(`Surah number out of range: ${s.number}`); break;
    }
    if (seen.has(s.number)) { issues.push(`Duplicate surah: ${s.number}`); break; }
    seen.add(s.number);
  }
  if (issues.length === 0) {
    for (let i = 0; i < 113; i++) {
      if (surahList[i].number + 1 !== surahList[i + 1].number) {
        issues.push(`Surah ordering gap at index ${i}`); break;
      }
    }
  }
  // Check text
  for (const s of surahList) {
    const key = String(s.number);
    if (!text[key]) { issues.push(`Surah ${s.number} (${s.name}) missing from text`); continue; }
    const ayahCount = Object.keys(text[key]).length;
    if (ayahCount !== s.ayahCount) {
      issues.push(`Surah ${s.number} ayah count: meta=${s.ayahCount}, text=${ayahCount}`); continue;
    }
    for (let i = 1; i <= s.ayahCount; i++) {
      if (!text[key][String(i)]) { issues.push(`Surah ${s.number} ayah ${i} missing`); break; }
    }
    if (issues.length > 5) break;
  }
  return issues;
}

export function getSurahs() { return surahs; }
export function getSurahMeta(num) { return surahs ? surahs.find(s => s.number === Number(num)) : null; }
export function getAyahText(surah, ayah) {
  if (!quranText) return '';
  const s = quranText[String(surah)];
  if (!s) return '';
  return s[String(ayah)] ?? '';
}
export function getSurahAyahs(surah) {
  if (!quranText) return {};
  return quranText[String(surah)] ?? {};
}
export function isQuranLoaded() { return !!(surahs && quranText); }

/* ===== Bismillah logic (spec section 13: "البسملة في موضعها الصحيح") =====
   - Surah 1 (Fatiha): bismillah is ayah 1, do NOT add prefix
   - Surah 9 (Tawba): no bismillah at all
   - All other surahs: show bismillah header
*/
export const BISMILLAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
export function shouldShowBismillah(surahNum) {
  return surahNum !== 1 && surahNum !== 9;
}
