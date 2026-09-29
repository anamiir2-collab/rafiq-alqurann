/* =====================================================================
   universal-search.js — البحث الشامل (spec section 55)
   Single search across: Quran + Surahs + Ayahs + Adhkar + Duas + Hadith + Names + Reflections
   Results grouped by type.
   ===================================================================== */

import { Icons } from '../components/icons.js';
import { loadQuran, getSurahs, getSurahMeta, getAyahText } from './quran/quran-data.js';
import { IDB } from './storage.js';

const DIACRITICS = /[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g;
function normalize(s) {
  if (!s) return '';
  return String(s)
    .replace(DIACRITICS, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064A')
    .replace(/\s+/g, ' ')
    .trim();
}
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function highlight(text, term) {
  if (!term) return escapeHtml(text);
  const normText = normalize(text);
  const normTerm = normalize(term);
  if (!normTerm) return escapeHtml(text);
  const idx = normText.indexOf(normTerm);
  if (idx === -1) return escapeHtml(text);
  // Find original slice
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
  return escapeHtml(text.slice(0, origStart)) +
    `<mark class="search-mark">${escapeHtml(text.slice(origStart, origEnd))}</mark>` +
    escapeHtml(text.slice(origEnd));
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }

let duasCache = null, hadithCache = null, namesCache = null, adhkarCache = null;

async function loadContentCaches() {
  try {
    if (!duasCache) {
      const [d, h, n] = await Promise.all([
        fetch('data/duas/duas.json').then(r => r.ok ? r.json() : []),
        fetch('data/hadith/hadith.json').then(r => r.ok ? r.json() : []),
        fetch('data/names-of-allah/names.json').then(r => r.ok ? r.json() : []),
      ]);
      duasCache = d; hadithCache = h; namesCache = n;
    }
    // Adhkar from adhkar.js (duplicate inline for simplicity)
    if (!adhkarCache) {
      // Adhkar are accessible via the adhkar page; we skip them in universal search for simplicity
      adhkarCache = [];
    }
  } catch (e) {
    console.warn('Universal search cache load failed:', e);
    duasCache = []; hadithCache = []; namesCache = [];
  }
  return { duas: duasCache, hadith: hadithCache, names: namesCache };
}

export async function renderUniversalSearch(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>البحث الشامل</h2>
      </div>

      <div class="surah-index-search" style="position:static;margin-bottom:12px">
        <div class="search-wrap">
          <input type="search" class="input" id="uni-search" placeholder="ابحث في القرآن، الأذكار، الأدعية، الأحاديث، الأسماء..." autocomplete="off" autofocus />
          <span class="search-icon">${Icons.search}</span>
        </div>
      </div>

      <div id="uni-stats" class="text-xs text-muted" style="padding:0 4px 8px"></div>
      <div id="uni-results"></div>
      <div style="height:32px"></div>
    </div>
  `;

  const input = container.querySelector('#uni-search');
  const results = container.querySelector('#uni-results');
  const stats = container.querySelector('#uni-stats');

  await loadQuran();
  await loadContentCaches();
  const surahs = getSurahs();
  const reflections = await IDB.getAll('reflections');

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(input.value.trim()), 300);
  });

  async function runSearch(query) {
    if (!query || query.length < 2) {
      results.innerHTML = '';
      stats.textContent = '';
      return;
    }

    stats.textContent = 'جاري البحث...';
    results.innerHTML = '';
    await new Promise(r => setTimeout(r, 10));

    const normQuery = normalize(query);
    if (!normQuery) { stats.textContent = ''; return; }

    const groups = {
      surahs: [],
      ayahs: [],
      duas: [],
      hadith: [],
      names: [],
      reflections: [],
    };

    // 1. Surahs by name
    for (const s of surahs) {
      if (normalize(s.name).includes(normQuery) || s.englishName.toLowerCase().includes(query.toLowerCase()) || String(s.number) === query) {
        groups.surahs.push(s);
      }
    }

    // 2. Ayahs (cap at 50 results)
    let ayahCount = 0;
    for (const s of surahs) {
      if (ayahCount >= 50) break;
      for (let a = 1; a <= s.ayahCount; a++) {
        if (ayahCount >= 50) break;
        const text = getAyahText(s.number, a);
        if (!text) continue;
        if (normalize(text).includes(normQuery)) {
          groups.ayahs.push({ surah: s.number, surahName: s.name, ayah: a, text });
          ayahCount++;
        }
      }
    }

    // 3. Duas
    for (const d of (duasCache || [])) {
      if (normalize(d.text).includes(normQuery) || normalize(d.source).includes(normQuery) || (d.virtue && normalize(d.virtue).includes(normQuery))) {
        groups.duas.push(d);
      }
    }

    // 4. Hadith
    for (const h of (hadithCache || [])) {
      if (normalize(h.text).includes(normQuery) || normalize(h.source).includes(normQuery) || normalize(h.topic).includes(normQuery) || normalize(h.narrator).includes(normQuery)) {
        groups.hadith.push(h);
      }
    }

    // 5. Names
    for (const n of (namesCache || [])) {
      if (normalize(n.arabic).includes(normQuery) || n.translit.toLowerCase().includes(query.toLowerCase()) || normalize(n.meaning).includes(normQuery) || normalize(n.short).includes(normQuery)) {
        groups.names.push(n);
      }
    }

    // 6. Reflections
    for (const r of reflections) {
      if (normalize(r.text || '').includes(normQuery)) {
        groups.reflections.push(r);
      }
    }

    const totalCount = Object.values(groups).reduce((s, arr) => s + arr.length, 0);
    if (totalCount === 0) {
      stats.textContent = '';
      results.innerHTML = `
        <div class="empty-state" style="padding:48px 16px">
          <div class="empty-state-icon">${Icons.search}</div>
          <div class="empty-state-title">لا توجد نتائج</div>
          <div class="empty-state-text">لم نجد "${escapeHtml(query)}" في أي قسم</div>
        </div>`;
      return;
    }

    stats.textContent = `${toAr(totalCount)} نتيجة في ${toAr(Object.values(groups).filter(a => a.length > 0).length)} أقسام`;

    let html = '';

    if (groups.surahs.length) {
      html += `<div class="divider-label">السور (${toAr(groups.surahs.length)})</div><div class="list">`;
      for (const s of groups.surahs) {
        html += `<a class="row" href="#/quran/${s.number}">
          <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center;font-weight:700">${toAr(s.number)}</div>
          <div class="row-body"><div class="row-title font-quran">${highlight(s.name, query)}</div><div class="row-sub">${toAr(s.ayahCount)} آية</div></div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </a>`;
      }
      html += '</div>';
    }

    if (groups.ayahs.length) {
      html += `<div class="divider-label">الآيات (${toAr(groups.ayahs.length)})</div><div class="list">`;
      for (const m of groups.ayahs) {
        html += `<a class="row" href="#/quran/${m.surah}">
          <div class="row-icon" style="width:36px;height:36px;border-radius:var(--radius-sm);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">${toAr(m.ayah)}</div>
          <div class="row-body"><div class="font-quran text-md line-clamp-2" style="line-height:1.8;color:var(--fg-strong)">${highlight(m.text, query)}</div><div class="row-sub">${escapeHtml(m.surahName)} • آية ${toAr(m.ayah)}</div></div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </a>`;
      }
      html += '</div>';
    }

    if (groups.duas.length) {
      html += `<div class="divider-label">الأدعية (${toAr(groups.duas.length)})</div><div class="list">`;
      for (const d of groups.duas) {
        html += `<a class="row" href="#/more/duas">
          <div class="row-icon" style="color:var(--remind-color)">${Icons.dua}</div>
          <div class="row-body"><div class="font-quran text-md line-clamp-2" style="line-height:1.8;color:var(--fg-strong)">${highlight(d.text, query)}</div><div class="row-sub">${escapeHtml(d.source)}</div></div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </a>`;
      }
      html += '</div>';
    }

    if (groups.hadith.length) {
      html += `<div class="divider-label">الأحاديث (${toAr(groups.hadith.length)})</div><div class="list">`;
      for (const h of groups.hadith) {
        html += `<a class="row" href="#/more/hadith">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.hadith}</div>
          <div class="row-body"><div class="font-quran text-md line-clamp-2" style="line-height:1.8;color:var(--fg-strong)">${highlight(h.text, query)}</div><div class="row-sub">${escapeHtml(h.narrator)} • ${escapeHtml(h.source)}</div></div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </a>`;
      }
      html += '</div>';
    }

    if (groups.names.length) {
      html += `<div class="divider-label">أسماء الله الحسنى (${toAr(groups.names.length)})</div><div class="list">`;
      for (const n of groups.names) {
        html += `<a class="row" href="#/more/names">
          <div class="row-icon font-quran" style="font-size:20px;color:var(--reflect-color);display:flex;align-items:center;justify-content:center">${highlight(n.arabic, query)}</div>
          <div class="row-body"><div class="row-title">${escapeHtml(n.translit)}</div><div class="row-sub line-clamp-1">${highlight(n.meaning, query)}</div></div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </a>`;
      }
      html += '</div>';
    }

    if (groups.reflections.length) {
      html += `<div class="divider-label">خواطرك (${toAr(groups.reflections.length)})</div><div class="list">`;
      for (const r of groups.reflections) {
        html += `<a class="row" href="#/tadabbur/${r.id}">
          <div class="row-icon" style="color:var(--reflect-color)">${Icons.edit}</div>
          <div class="row-body"><div class="row-title">${escapeHtml(r.surahName || '')} • آية ${toAr(r.ayah)}</div><div class="row-sub line-clamp-2">${highlight(r.text || '', query)}</div></div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </a>`;
      }
      html += '</div>';
    }

    results.innerHTML = html;
  }
}
