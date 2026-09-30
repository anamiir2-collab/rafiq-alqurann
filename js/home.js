/* =====================================================================
   home.js v4 — Premium iPhone-style Dashboard
   ---------------------------------------------------------------------
   Layout (top → bottom):
   1) Brand bar: رفيق القرآن + tagline + search + settings
   2) Hijri date pill
   3) Continue reading hero card (primary visual element)
   4) Wird of the day (progress ring)
   5) Quran tools grid (8 cards)
   6) Optional quick links
   ===================================================================== */

import { State } from './state.js';
import { navigate } from './router.js';
import { Icons } from '../components/icons.js';
import { loadQuran, getSurahs, getSurahMeta, getAyahText } from './quran/quran-data.js';
import { Storage } from './storage.js';

const AYAH_OF_DAY_KEY = 'rafiq-ayah-of-day';

/* Stable per-day ayah picker (deterministic, not random each refresh) */
async function getAyahOfDay() {
  await loadQuran();
  const surahs = getSurahs();
  if (!surahs || surahs.length === 0) return null;

  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const cached = Storage.get(AYAH_OF_DAY_KEY, null);
  if (cached && cached.dateKey === dateKey) return cached.ayah;

  // Deterministic pick: seed from date
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  // Pick a meaningful short surah from middle of Quran
  const surahIdx = (seed % 110) + 2; // 2..111
  const surah = surahs[surahIdx - 1];
  if (!surah) return null;
  const ayahNum = (seed % surah.ayahCount) + 1;
  const text = getAyahText(surah.number, ayahNum);
  const ayah = { surah: surah.number, ayah: ayahNum, text, surahName: surah.name };
  Storage.set(AYAH_OF_DAY_KEY, { dateKey, ayah });
  return ayah;
}

function hijriDate() {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());
  } catch { return ''; }
}

/* Compute Wird progress (juz-based) from state */
function getWirdProgress() {
  const wird = State.getSlice('wird');
  const plans = wird?.plans || [];
  const active = plans.find(p => p.id === wird?.activePlanId) || plans[0];
  if (!active) {
    // Default: show 0/5 juz as a sensible placeholder
    return { current: 0, target: 5, pct: 0 };
  }
  const current = active.progress?.juzRead || 0;
  const target = active.target || 5;
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return { current, target, pct };
}

/* Render progress ring SVG */
function renderProgressRing(pct, size = 64, stroke = 6) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <defs>
        <linearGradient id="wurd-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--c-primary)"/>
          <stop offset="100%" stop-color="var(--c-mint)"/>
        </linearGradient>
      </defs>
      <circle class="ring-bg" cx="${size/2}" cy="${size/2}" r="${r}"/>
      <circle class="ring-fg" cx="${size/2}" cy="${size/2}" r="${r}"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
    </svg>
  `;
}

export async function renderHome(container) {
  const user = State.getSlice('user');
  const name = user?.name || 'يا صاحب القرآن';

  container.innerHTML = `
    <div class="page container-app">

      <!-- 1) Brand bar -->
      <div class="home-brand">
        <div class="brand-text">
          <div class="brand-name">
            <span class="brand-glyph">ر ق</span>
            رفيق القرآن
          </div>
          <div class="brand-tagline">رفيقك في كل آية</div>
          <div class="home-date-pill">
            ${Icons.calendar}
            <span class="hijri">${hijriDate()}</span>
          </div>
        </div>
        <div class="brand-actions">
          <a class="brand-btn" href="#/search" aria-label="البحث">${Icons.search}</a>
          <a class="brand-btn" href="#/settings" aria-label="الإعدادات">${Icons.settings}</a>
        </div>
      </div>

      <!-- 2) Continue reading hero card -->
      <a class="continue-hero" href="#/quran/${State.getSlice('quran').lastSurah || 1}">
        <div class="hero-label">
          ${Icons.bookOpen}
          أكمل قراءتك
        </div>
        <div class="hero-surah-name" id="hero-surah-name">جارٍ التحميل...</div>
        <div class="hero-ayah-info">
          الآية <span class="hero-ayah-num" id="hero-ayah-num">١</span> من <span id="hero-ayah-total">٢٨٦</span>
        </div>
        <div class="hero-progress-wrap">
          <div class="hero-progress-top">
            <span class="hero-progress-label">التقدّم في السورة</span>
            <span class="hero-progress-pct" id="hero-pct">٠٪</span>
          </div>
          <div class="hero-progress">
            <div class="hero-progress-bar" id="hero-bar" style="width:0"></div>
          </div>
        </div>
        <div class="hero-cta">
          متابعة القراءة
          ${Icons.arrowLeft}
        </div>
      </a>

      <!-- 3) Wird of the day -->
      <a class="wurd-card" href="#/wird">
        <div class="wurd-ring">
          ${renderProgressRing(0)}
          <div class="ring-text" id="wurd-pct">٠٪</div>
        </div>
        <div class="wurd-body">
          <div class="wurd-label">وردي اليوم</div>
          <div class="wurd-title" id="wurd-title">لم تبدأ ورد اليوم بعد</div>
          <div class="wurd-sub" id="wurd-sub">اضغط لتحديد هدفك اليومي</div>
        </div>
        <div class="wurd-arrow">${Icons.chevronLeft}</div>
      </a>

      <!-- 4) Quran tools grid -->
      <div class="tools-section">
        <div class="tools-section-title">
          <span class="tools-decor"></span>
          أدوات القرآن
        </div>
        <div class="tools-grid">
          <a class="tool-card t-quran" href="#/quran">
            <div class="tool-icon">${Icons.quran}</div>
            <div>
              <div class="tool-title">القرآن</div>
              <div class="tool-sub">اقرأ القرآن الكريم</div>
            </div>
          </a>
          <a class="tool-card t-tafsir" href="#/more/tafsir">
            <div class="tool-icon">${Icons.book}</div>
            <div>
              <div class="tool-title">التفسير</div>
              <div class="tool-sub">افهم معاني الآيات</div>
            </div>
          </a>
          <a class="tool-card t-tadabbur" href="#/tadabbur">
            <div class="tool-icon">${Icons.reflect}</div>
            <div>
              <div class="tool-title">التدبر</div>
              <div class="tool-sub">تدبر آيات القرآن</div>
            </div>
          </a>
          <a class="tool-card t-tajweed" href="#/quran/1">
            <div class="tool-icon">${Icons.tajweed}</div>
            <div>
              <div class="tool-title">التجويد</div>
              <div class="tool-sub">تعلم أحكام التجويد</div>
            </div>
          </a>
          <a class="tool-card t-hifz" href="#/hifz">
            <div class="tool-icon">${Icons.bookmark}</div>
            <div>
              <div class="tool-title">المحفوظات</div>
              <div class="tool-sub">الآيات والسور المحفوظة</div>
            </div>
          </a>
          <a class="tool-card t-khawater" href="#/tadabbur">
            <div class="tool-icon">${Icons.edit}</div>
            <div>
              <div class="tool-title">الخواطر</div>
              <div class="tool-sub">اكتب خواطرك حول الآيات</div>
            </div>
          </a>
          <a class="tool-card t-search" href="#/quran/search">
            <div class="tool-icon">${Icons.search}</div>
            <div>
              <div class="tool-title">البحث</div>
              <div class="tool-sub">ابحث داخل القرآن</div>
            </div>
          </a>
          <a class="tool-card t-adhkar" href="#/more/adhkar">
            <div class="tool-icon">${Icons.adhkar}</div>
            <div>
              <div class="tool-title">الأذكار</div>
              <div class="tool-sub">أذكار المسلم</div>
            </div>
          </a>
        </div>
      </div>

      <div style="height:24px"></div>
    </div>
  `;

  // Async: fill continue reading card
  try {
    await loadQuran();
    const quranState = State.getSlice('quran');
    const last = quranState.lastSurah || 1;
    const lastAyah = quranState.lastAyah || 1;
    const meta = getSurahMeta(last);
    if (meta) {
      const progress = Math.min(100, Math.round((lastAyah / meta.ayahCount) * 100));
      const nameEl = container.querySelector('#hero-surah-name');
      const numEl = container.querySelector('#hero-ayah-num');
      const totalEl = container.querySelector('#hero-ayah-total');
      const pctEl = container.querySelector('#hero-pct');
      const barEl = container.querySelector('#hero-bar');
      if (nameEl)  nameEl.textContent = meta.name;
      if (numEl)   numEl.textContent = toAr(lastAyah);
      if (totalEl) totalEl.textContent = toAr(meta.ayahCount);
      if (pctEl)   pctEl.textContent = `${toAr(progress)}٪`;
      if (barEl)   barEl.style.width = `${progress}%`;
    }
  } catch (e) { console.warn('Continue card fill failed', e); }

  // Async: fill wird progress
  try {
    const { current, target, pct } = getWirdProgress();
    const ringEl = container.querySelector('.wurd-ring');
    const pctEl = container.querySelector('#wurd-pct');
    const titleEl = container.querySelector('#wurd-title');
    const subEl = container.querySelector('#wurd-sub');
    if (ringEl) {
      const r = 29;
      const c = 2 * Math.PI * r;
      const offset = c * (1 - pct / 100);
      const fg = ringEl.querySelector('.ring-fg');
      if (fg) fg.setAttribute('stroke-dashoffset', offset);
    }
    if (pctEl) pctEl.textContent = `${toAr(pct)}٪`;
    if (titleEl) {
      titleEl.textContent = current > 0
        ? `${toAr(current)} من ${toAr(target)} أجزاء`
        : 'لم تبدأ ورد اليوم بعد';
    }
    if (subEl) {
      subEl.textContent = current > 0
        ? `بقيت ${toAr(Math.max(0, target - current))} جزء`
        : 'اضغط لتحديد هدفك اليومي';
    }
  } catch (e) { console.warn('Wird fill failed', e); }
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
