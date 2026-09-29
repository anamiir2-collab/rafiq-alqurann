/* =====================================================================
   search.js — Quran search (spec section 20, 55)
   - Full-text search across all 114 surahs / 6236 ayahs
   - Highlight matched term in results
   - Strip diacritics for matching (so "ملك" finds "مَٰلِكِ")
   - Group results by surah
   ===================================================================== */

import { loadQuran, getSurahs, getSurahMeta, getAyahText } from './quran-data.js';
import { State } from '../state.js';
import { navigate } from '../router.js';
import { Icons } from '../../components/icons.js';

const DIACRITICS = /[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g;

function normalize(s) {
  if (!s) return '';
  return String(s)
    .replace(DIACRITICS, '')        // remove harakat
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')  // unify alef variants (incl. alef wasla ٱ)
    .replace(/\u0629/g, '\u0647')   // taa marbuta → haa
    .replace(/\u0649/g, '\u064A')   // alef maqsura → yaa
    .replace(/\s+/g, ' ')
    .trim();
}

function highlight(text, term) {
  if (!term) return escapeHtml(text);
  const normText = normalize(text);
  const normTerm = normalize(term);
  if (!normTerm) return escapeHtml(text);
  const idx = normText.indexOf(normTerm);
  if (idx === -1) return escapeHtml(text);
  // Map back to original positions (lengths differ due to diacritics)
  // Simple approach: find original slice by walking
  let origStart = 0, origEnd = text.length;
  let nIdx = 0;
  for (let i = 0; i < text.length; i++) {
    const n = normalize(text[i]);
    if (nIdx === idx && n) { origStart = i; break; }
    if (n) nIdx += n.length;
  }
  let endNIdx = idx + normTerm.length;
  nIdx = 0;
  for (let i = 0; i < text.length; i++) {
    const n = normalize(text[i]);
    if (n) nIdx += n.length;
    if (nIdx >= endNIdx) { origEnd = i + 1; break; }
  }
  const before = text.slice(0, origStart);
  const match = text.slice(origStart, origEnd);
  const after = text.slice(origEnd);
  return `${escapeHtml(before)}<mark class="search-mark">${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }

export async function renderSearch(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>البحث في القرآن</h2>
      </div>
      <div class="surah-index-search" style="position:static">
        <div class="search-wrap">
          <input
            type="search"
            class="input"
            id="quran-search"
            placeholder="ابحث عن كلمة أو عبارة..."
            autocomplete="off"
            autofocus
          />
          <span class="search-icon">${Icons.search}</span>
        </div>
      </div>

      <div id="search-stats" class="text-xs text-muted mt-2" style="padding:0 4px 8px"></div>
      <div id="search-results"></div>
    </div>
  `;

  const input = container.querySelector('#quran-search');
  const results = container.querySelector('#search-results');
  const stats = container.querySelector('#search-stats');

  await loadQuran();
  const surahs = getSurahs();

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(input.value.trim()), 250);
  });

  async function runSearch(query) {
    if (!query || query.length < 2) {
      results.innerHTML = '';
      stats.textContent = '';
      return;
    }

    stats.textContent = 'جاري البحث...';
    results.innerHTML = '';

    // Yield to UI
    await new Promise(r => setTimeout(r, 10));

    const normQuery = normalize(query);
    if (!normQuery) {
      stats.textContent = '';
      return;
    }

    const matches = [];
    for (const s of surahs) {
      for (let a = 1; a <= s.ayahCount; a++) {
        const text = getAyahText(s.number, a);
        if (!text) continue;
        if (normalize(text).includes(normQuery)) {
          matches.push({ surah: s.number, surahName: s.name, ayah: a, text });
          if (matches.length >= 200) break; // cap
        }
      }
      if (matches.length >= 200) break;
    }

    if (matches.length === 0) {
      stats.textContent = '';
      results.innerHTML = `
        <div class="empty-state" style="padding:48px 16px">
          <div class="empty-state-icon">${Icons.search}</div>
          <div class="empty-state-title">لا توجد نتائج</div>
          <div class="empty-state-text">لم نجد "${escapeHtml(query)}" في القرآن الكريم</div>
        </div>`;
      return;
    }

    stats.textContent = `${toAr(matches.length)} نتيجة${matches.length >= 200 ? ' (أظهرنا أول ٢٠٠)' : ''}`;

    // Group by surah
    const bySurah = new Map();
    for (const m of matches) {
      if (!bySurah.has(m.surah)) bySurah.set(m.surah, []);
      bySurah.get(m.surah).push(m);
    }

    const html = [];
    for (const [surahNum, items] of bySurah) {
      const meta = getSurahMeta(surahNum);
      html.push(`
        <div class="divider-label" style="margin-top:16px">${meta.name} • ${toAr(items.length)} نتيجة</div>
        <div class="list">
          ${items.map(m => `
            <a class="row" href="#/quran/${m.surah}">
              <div class="row-icon" style="width:36px;height:36px;border-radius:var(--radius-sm);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">
                ${toAr(m.ayah)}
              </div>
              <div class="row-body">
                <div class="font-quran text-lg" style="line-height:1.8;color:var(--fg-strong);margin-bottom:4px">${highlight(m.text, query)}</div>
                <div class="row-sub">${m.surahName} • آية ${toAr(m.ayah)}</div>
              </div>
              <div class="row-trail">${Icons.chevronLeft}</div>
            </a>
          `).join('')}
        </div>
      `);
    }

    results.innerHTML = html.join('');
  }
}
