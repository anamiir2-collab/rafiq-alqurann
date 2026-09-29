/* =====================================================================
   tafsir.js — التفسير (spec section 52)
   - Provides access to tafsir via external API (alquran.cloud)
   - Multiple tafsir sources available
   - Clear: NOT AI-generated. From verified classical sources.
   ===================================================================== */

import { Icons } from '../../components/icons.js';
import { getSurahMeta, getAyahText, loadQuran, getSurahs } from '../quran/quran-data.js';
import { toast } from '../../components/toast.js';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// AlQuran.cloud API for tafsir (verified sources)
const TAFSIR_SOURCES = [
  { id: 'ar.muyassar',     name: 'التفسير الميسر',     style: 'مختصر ميسّر' },
  { id: 'ar.jalalayn',     name: 'تفسير الجلالين',     style: 'مختصر جداً' },
  { id: 'ar.mukhtasar',    name: 'المختصر في التفسير', style: 'مختصر' },
];

export async function renderTafsir(container, params) {
  await loadQuran();
  const surahNum = params?.surah ? Number(params.surah) : null;
  const ayahNum = params?.ayah ? Number(params.ayah) : null;

  if (surahNum && ayahNum) {
    await showTafsirForAyah(container, surahNum, ayahNum);
  } else {
    await showTafsirHome(container);
  }
}

async function showTafsirHome(container) {
  const surahs = getSurahs();
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>التفسير</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-blue) 18%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
          ${Icons.book}
        </div>
        <h3 class="h3">تفسير القرآن</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
          من مصادر موثوقة (الميسر، الجلالين)
        </p>
      </div>

      <div class="card card-pad" style="background:color-mix(in srgb,var(--c-blue) 8%,transparent);border-color:transparent;margin-bottom:16px">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} للوصول للتفسير: افتح أي سورة من الفهرس، اضغط على كلمة في الآية، ثم اختر «تفسير» من القائمة.
        </div>
      </div>

      <div class="divider-label">اختر سورة</div>
      <div class="surah-index-search" style="position:static;margin-bottom:12px">
        <div class="search-wrap">
          <input type="search" class="input" id="tafsir-search" placeholder="ابحث عن سورة..." autocomplete="off" />
          <span class="search-icon">${Icons.search}</span>
        </div>
      </div>
      <div class="list" id="tafsir-list">
        ${surahs.slice(0, 20).map(s => `
          <a class="row" href="#/quran/${s.number}">
            <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center;font-weight:700">${toAr(s.number)}</div>
            <div class="row-body">
              <div class="row-title font-quran">${escapeHtml(s.name)}</div>
              <div class="row-sub">${toAr(s.ayahCount)} آية</div>
            </div>
            <div class="row-trail">${Icons.chevronLeft}</div>
          </a>
        `).join('')}
      </div>

      <div style="height:32px"></div>
    </div>
  `;

  const search = container.querySelector('#tafsir-search');
  const list = container.querySelector('#tafsir-list');
  search.addEventListener('input', (e) => {
    const f = e.target.value.trim().toLowerCase();
    const items = surahs.filter(s => !f || s.name.toLowerCase().includes(f) || s.englishName.toLowerCase().includes(f) || String(s.number).includes(f));
    list.innerHTML = items.slice(0, 30).map(s => `
      <a class="row" href="#/quran/${s.number}">
        <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center;font-weight:700">${toAr(s.number)}</div>
        <div class="row-body">
          <div class="row-title font-quran">${escapeHtml(s.name)}</div>
          <div class="row-sub">${toAr(s.ayahCount)} آية</div>
        </div>
        <div class="row-trail">${Icons.chevronLeft}</div>
      </a>
    `).join('') || '<div class="empty-state" style="padding:24px"><div class="empty-state-text">لا توجد نتائج</div></div>';
  });
}

export async function fetchTafsir(surah, ayah, sourceId = 'ar.muyassar') {
  // AlQuran.cloud API
  const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${sourceId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    if (json.code !== 200 || !json.data) throw new Error('Bad response');
    return json.data.text || '';
  } catch (e) {
    console.warn('Tafsir fetch failed:', e);
    return null;
  }
}

async function showTafsirForAyah(container, surah, ayah) {
  const meta = getSurahMeta(surah);
  if (!meta) { location.hash = '/more/tafsir'; return; }

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>التفسير</h2>
      </div>

      <div class="card card-pad-lg" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div class="text-xs text-muted">${escapeHtml(meta.name)} • آية ${toAr(ayah)}</div>
        <div class="font-quran text-lg mt-2" style="line-height:1.9;color:var(--fg-strong)">${escapeHtml(getAyahText(surah, ayah))}</div>
      </div>

      <div class="divider-label">اختر التفسير</div>
      <div class="list" id="tafsir-sources-list">
        ${TAFSIR_SOURCES.map(s => `
          <button class="row" data-source="${s.id}">
            <div class="row-icon" style="color:var(--quran-color)">${Icons.book}</div>
            <div class="row-body">
              <div class="row-title">${escapeHtml(s.name)}</div>
              <div class="row-sub">${escapeHtml(s.style)}</div>
            </div>
            <div class="row-trail">${Icons.chevronLeft}</div>
          </button>
        `).join('')}
      </div>

      <div id="tafsir-content"></div>
      <div style="height:32px"></div>
    </div>
  `;

  container.querySelectorAll('[data-source]').forEach(btn => {
    btn.onclick = async () => {
      const sourceId = btn.getAttribute('data-source');
      const source = TAFSIR_SOURCES.find(s => s.id === sourceId);
      const contentEl = container.querySelector('#tafsir-content');
      contentEl.innerHTML = `
        <div class="card card-pad">
          <div class="text-xs text-muted mb-2">جاري تحميل ${escapeHtml(source.name)}...</div>
          <div class="skeleton" style="height:80px"></div>
        </div>`;
      const text = await fetchTafsir(surah, ayah, sourceId);
      if (text) {
        contentEl.innerHTML = `
          <div class="divider-label">${escapeHtml(source.name)}</div>
          <div class="card card-pad">
            <div class="text-md" style="line-height:1.9">${escapeHtml(text)}</div>
          </div>`;
      } else {
        contentEl.innerHTML = `
          <div class="card card-pad text-center" style="background:color-mix(in srgb,#C53030 8%,transparent);border-color:transparent">
            <div class="text-sm" style="color:#C53030">
              تعذر تحميل التفسير. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.
            </div>
          </div>`;
      }
    };
  });
}
