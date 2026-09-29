/* =====================================================================
   reader.js — Quran Reader (spec sections 11, 13, 15, 19, 20)
   - Surah index (114 surahs, search, filter, quick jump)
   - Surah reader (Uthmani text, decorative ayah numbers, word tap → sheet)
   ===================================================================== */

import { loadQuran, getSurahs, getSurahMeta, getAyahText, getSurahAyahs, shouldShowBismillah, BISMILLAH_TEXT } from './quran-data.js';
import { State } from '../state.js';
import { navigate } from '../router.js';
import { Icons } from '../../components/icons.js';
import { openSheet } from '../../components/bottom-sheet.js';
import { toast } from '../../components/toast.js';
import { Storage, IDB } from '../storage.js';

/* ============ Surah Index ============ */
export async function renderSurahIndex(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>القرآن الكريم</h2>
        <span class="text-sm text-muted">١١٤ سورة</span>
      </div>
      <div class="surah-index-search">
        <div class="search-wrap">
          <input
            type="search"
            class="input"
            id="surah-search"
            placeholder="ابحث عن سورة..."
            autocomplete="off"
          />
          <span class="search-icon">${Icons.search}</span>
        </div>
      </div>
      <div id="surah-list" class="list"></div>
    </div>
  `;

  const list = container.querySelector('#surah-list');
  const search = container.querySelector('#surah-search');

  try {
    await loadQuran();
    const surahs = getSurahs();
    const quranState = State.getSlice('quran');
    const lastSurah = quranState.lastSurah || 1;

    function renderList(filter = '') {
      const f = filter.trim().toLowerCase();
      const items = surahs.filter(s => {
        if (!f) return true;
        return s.name.toLowerCase().includes(f) ||
               s.englishName.toLowerCase().includes(f) ||
               String(s.number).includes(f);
      });
      if (items.length === 0) {
        list.innerHTML = `
          <div class="empty-state" style="padding:32px 16px">
            <div class="empty-state-icon">${Icons.search}</div>
            <div class="empty-state-title">لا توجد نتائج</div>
            <div class="empty-state-text">جرّب كلمة أخرى</div>
          </div>`;
        return;
      }
      list.innerHTML = items.map(s => {
        const isLast = s.number === lastSurah;
        const revelationLabel = s.revelationType === 'meccan' ? 'مكية' : 'مدنية';
        return `
          <a class="surah-row" href="#/quran/${s.number}">
            <div class="surah-num">${toArabic(s.number)}</div>
            <div class="surah-body">
              <div class="surah-name">${s.name}</div>
              <div class="surah-meta">
                <span>${revelationLabel}</span>
                <span class="dot"></span>
                <span>${toArabic(s.ayahCount)} آية</span>
                ${isLast ? `<span class="dot"></span><span class="badge badge-quran">آخر قراءة</span>` : ''}
              </div>
            </div>
            <div class="surah-trail">${Icons.chevronLeft}</div>
          </a>
        `;
      }).join('');
    }

    renderList();
    search.addEventListener('input', (e) => renderList(e.target.value));

  } catch (e) {
    console.error('Failed to load Quran:', e);
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${Icons.alert}</div>
        <div class="empty-state-title">تعذر تحميل القرآن</div>
        <div class="empty-state-text">تأكد من اتصالك بالإنترنت ثم أعد المحاولة</div>
      </div>`;
  }
}

/* ============ Surah Reader ============ */
export async function renderSurahReader(container, { surah }) {
  const surahNum = Number(surah);
  if (!surahNum || surahNum < 1 || surahNum > 114) {
    navigate('/quran');
    return;
  }

  container.innerHTML = `
    <div class="page container-app">
      <div id="reader-loading" class="empty-state" style="padding:48px 16px">
        <div class="skeleton" style="width:60%;height:32px;margin:0 auto 12px"></div>
        <div class="skeleton" style="width:40%;height:14px;margin:0 auto"></div>
      </div>
    </div>
  `;

  try {
    await loadQuran();
    const meta = getSurahMeta(surahNum);
    if (!meta) { navigate('/quran'); return; }
    const ayahs = getSurahAyahs(surahNum);

    // Update last position
    State.setSlice('quran', { lastSurah: surahNum, lastAyah: 1 });

    const quranState = State.getSlice('quran');
    const fontSize = quranState.fontSize || 26;
    const lineHeight = quranState.lineHeight || 2.15;

    container.innerHTML = `
      <div class="page container-app" id="reader-page">
        <div class="reader-header">
          <div class="surah-title">${meta.name}</div>
          <div class="surah-subtitle">
            <span>${meta.revelationType === 'meccan' ? 'مكية' : 'مدنية'}</span>
            <span class="dot"></span>
            <span>${toArabic(meta.ayahCount)} آية</span>
            <span class="dot"></span>
            <span>سورة رقم ${toArabic(meta.number)}</span>
          </div>
        </div>

        <div class="reader-controls">
          <div class="control-group">
            <button class="control-btn" id="font-dec" aria-label="تصغير الخط">${Icons.minus}</button>
            <span class="control-value" id="font-val">${toArabic(fontSize)}</span>
            <button class="control-btn" id="font-inc" aria-label="تكبير الخط">${Icons.plus}</button>
          </div>
          <div class="control-group">
            <button class="control-btn" id="line-dec" aria-label="تقليل التباعد">${Icons.minus}</button>
            <span class="control-value" id="line-val">${toArabic(Math.round(lineHeight * 10))}</span>
            <button class="control-btn" id="line-inc" aria-label="زيادة التباعد">${Icons.plus}</button>
          </div>
        </div>

        ${shouldShowBismillah(surahNum) ? `<div class="bismillah">${BISMILLAH_TEXT}</div>` : ''}

        <div id="ayah-container" style="--quran-font-size:${fontSize}px;--quran-line-height:${lineHeight}">
        </div>
      </div>
    `;

    const ayahContainer = container.querySelector('#ayah-container');
    ayahContainer.innerHTML = renderAyahs(surahNum, ayahs, meta);

    // Wire up controls
    wireReaderControls(container, surahNum);
    // Wire up ayah word taps
    wireAyahInteractions(container, surahNum, meta);

  } catch (e) {
    console.error('Surah render failed:', e);
    container.innerHTML = `
      <div class="page container-app">
        <div class="empty-state" style="padding:48px 16px">
          <div class="empty-state-icon">${Icons.alert}</div>
          <div class="empty-state-title">تعذر فتح السورة</div>
          <button class="btn btn-outline mt-4" onclick="location.hash='/quran'">العودة للفهرس</button>
        </div>
      </div>`;
  }
}

/* ============ Ayah rendering (Uthmani text + decorative numbers) ============ */
function renderAyahs(surahNum, ayahs, meta) {
  const html = [];
  for (let i = 1; i <= meta.ayahCount; i++) {
    const text = ayahs[String(i)] || '';
    const words = text.split(/\s+/).filter(Boolean);
    const wordsHtml = words.map((w, idx) =>
      `<span class="ayah-word" data-surah="${surahNum}" data-ayah="${i}" data-word="${idx}" data-text="${escapeAttr(w)}">${w}</span>`
    ).join(' ');

    html.push(`
      <div class="ayah-row" id="ayah-${surahNum}-${i}" data-surah="${surahNum}" data-ayah="${i}">
        <div class="ayah-text">${wordsHtml}<span class="ayah-num"><span>${toArabic(i)}</span></span></div>
        <div class="ayah-footer">
          <div class="text-xs text-muted">سورة ${meta.name} • آية ${toArabic(i)}</div>
          <div class="ayah-actions">
            <button class="ayah-action-btn" data-act="play" data-surah="${surahNum}" data-ayah="${i}" aria-label="تشغيل الآية">${Icons.play}</button>
            <button class="ayah-action-btn" data-act="bookmark" data-surah="${surahNum}" data-ayah="${i}" aria-label="حفظ الآية">${Icons.bookmark}</button>
            <button class="ayah-action-btn" data-act="reflect" data-surah="${surahNum}" data-ayah="${i}" aria-label="تدبر الآية">${Icons.edit}</button>
            <button class="ayah-action-btn" data-act="share" data-surah="${surahNum}" data-ayah="${i}" aria-label="مشاركة الآية">${Icons.share}</button>
          </div>
        </div>
      </div>
    `);
  }
  return html.join('');
}

/* ============ Reader controls ============ */
function wireReaderControls(container, surahNum) {
  const page = container.querySelector('#reader-page');
  if (!page) return;
  let { fontSize, lineHeight } = State.getSlice('quran');
  if (!fontSize) fontSize = 26;
  if (!lineHeight) lineHeight = 2.15;

  const update = () => {
    const ac = container.querySelector('#ayah-container');
    if (ac) {
      ac.style.setProperty('--quran-font-size', `${fontSize}px`);
      ac.style.setProperty('--quran-line-height', String(lineHeight));
    }
    container.querySelector('#font-val').textContent = toArabic(fontSize);
    container.querySelector('#line-val').textContent = toArabic(Math.round(lineHeight * 10));
    State.setSlice('quran', { fontSize, lineHeight });
  };

  container.querySelector('#font-inc').onclick = () => { fontSize = Math.min(48, fontSize + 2); update(); };
  container.querySelector('#font-dec').onclick = () => { fontSize = Math.min(48, Math.max(16, fontSize - 2)); update(); };
  container.querySelector('#line-inc').onclick = () => { lineHeight = Math.min(3.2, Math.round((lineHeight + 0.1) * 10) / 10); update(); };
  container.querySelector('#line-dec').onclick = () => { lineHeight = Math.max(1.4, Math.round((lineHeight - 0.1) * 10) / 10); update(); };
}

/* ============ Ayah interactions (word tap → bottom sheet — spec section 15) ============ */
async function wireAyahInteractions(container, surahNum, meta) {
  container.querySelectorAll('.ayah-word').forEach(el => {
    el.addEventListener('click', () => {
      const word = el.getAttribute('data-text');
      const ayah = Number(el.getAttribute('data-ayah'));
      const ayahText = getAyahText(surahNum, ayah);
      openSheet({
        title: word,
        subtitle: `سورة ${meta.name} • آية ${toArabic(ayah)}`,
        body: `<div class="font-quran text-lg text-center" style="line-height:1.9;color:var(--fg-strong);padding:8px 0">${ayahText}</div>`,
        actions: [
          { id: 'play',    label: 'تشغيل', icon: Icons.play,    onClick: () => { window.__playAyah?.(surahNum, ayah); } },
          { id: 'copy',    label: 'نسخ',   icon: Icons.copy,    onClick: () => { navigator.clipboard?.writeText(ayahText); toast('تم النسخ', 'success'); } },
          { id: 'share',   label: 'مشاركة', icon: Icons.share,   onClick: () => shareAyah(surahNum, ayah, ayahText, meta) },
          { id: 'fav',     label: 'مفضلة', icon: Icons.heart,   onClick: () => toggleFavorite(surahNum, ayah, ayahText, meta) },
          { id: 'bookmark',label: 'حفظ',  icon: Icons.bookmark, onClick: () => toggleBookmark(surahNum, ayah, meta) },
          { id: 'reflect', label: 'خاطرة', icon: Icons.edit,    onClick: () => { navigate(`/tadabbur/new/${surahNum}/${ayah}`); } },
          { id: 'tafsir',  label: 'تفسير', icon: Icons.book,    onClick: () => { toast('سيتم إضافة التفسير الموثوق قريبًا', 'info'); return false; } },
          { id: 'tadabbur',label: 'تدبر',  icon: Icons.reflect,  onClick: () => { navigate(`/tadabbur/${surahNum}/${ayah}`); } },
        ],
      });
    });
  });

  // Ayah action buttons (play/bookmark/reflect/share)
  container.querySelectorAll('.ayah-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = btn.getAttribute('data-act');
      const ayah = Number(btn.getAttribute('data-ayah'));
      const ayahText = getAyahText(surahNum, ayah);
      if (act === 'play')     window.__playAyah?.(surahNum, ayah);
      else if (act === 'bookmark') toggleBookmark(surahNum, ayah, meta);
      else if (act === 'reflect')  navigate(`/tadabbur/new/${surahNum}/${ayah}`);
      else if (act === 'share')    shareAyah(surahNum, ayah, ayahText, meta);
    });
  });
}

/* ============ Bookmarks (spec section 54) ============ */
async function toggleBookmark(surahNum, ayah, meta) {
  const id = `${surahNum}:${ayah}`;
  const existing = await IDB.get('bookmarks', id);
  if (existing) {
    await IDB.delete('bookmarks', id);
    toast('أُزيل من المحفوظات', 'info');
  } else {
    await IDB.put('bookmarks', {
      id,
      surah: surahNum,
      ayah,
      surahName: meta.name,
      text: getAyahText(surahNum, ayah),
      createdAt: new Date().toISOString(),
      type: 'ayah',
    });
    toast('تم الحفظ في المحفوظات', 'success');
  }
}

/* ============ Favorites (spec section 54) ============ */
async function toggleFavorite(surahNum, ayah, ayahText, meta) {
  const id = `ayah-${surahNum}-${ayah}`;
  const existing = await IDB.get('favorites', id);
  if (existing) {
    await IDB.delete('favorites', id);
    toast('أُزيل من المفضلة', 'info');
  } else {
    await IDB.put('favorites', {
      id, type: 'ayah', surah: surahNum, ayah, surahName: meta.name,
      text: ayahText, createdAt: new Date().toISOString(),
    });
    toast('تمت الإضافة للمفضلة', 'success');
  }
}

/* ============ Share ============ */
async function shareAyah(surahNum, ayah, text, meta) {
  const shareData = {
    title: `سورة ${meta.name} - آية ${toArabic(ayah)}`,
    text: `${text}\n\n— ${meta.name} (${toArabic(ayah)})`,
  };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (e) { /* user cancelled */ }
  } else {
    try {
      await navigator.clipboard.writeText(shareData.text);
      toast('تم النسخ — يمكنك لصقه ومشاركته', 'success');
    } catch { toast('تعذر المشاركة', 'error'); }
  }
}

/* ============ Helpers ============ */
const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toArabic(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeAttr(s) { return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
