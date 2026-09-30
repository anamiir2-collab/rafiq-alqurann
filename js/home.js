/* =====================================================================
   home.js v4 — Premium iPhone-style Dashboard (Sage/Cream)
   - Compact greeting with hijri date
   - Continue Reading HERO card (primary visual element)
   - Wurd card with Progress Ring
   - Ayah of the Day
   - Quran tools grid
   - Quick links
   - Prayer card
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

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'ليلة هادئة';
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'طاب يومك';
  if (h < 20) return 'مساء الخير';
  return 'ليلة مباركة';
}

function hijriDate() {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());
  } catch { return ''; }
}

/* Progress Ring SVG for Wurd */
function renderProgressRing(percent, label = '') {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, percent) / 100) * c;
  return `
    <div class="wurd-progress-ring">
      <svg viewBox="0 0 64 64">
        <circle class="ring-bg" cx="32" cy="32" r="${r}"></circle>
        <circle class="ring-fill" cx="32" cy="32" r="${r}"
          stroke-dasharray="${c}"
          stroke-dashoffset="${offset}"></circle>
      </svg>
      <div class="ring-text">${label || percent + '%'}</div>
    </div>
  `;
}

export async function renderHome(container) {
  const user = State.getSlice('user');
  const name = user?.name || 'يا صاحب القرآن';

  container.innerHTML = `
    <div class="page container-app">
      <!-- Greeting -->
      <div class="home-greeting">
        <div class="greeting-text">
          <div class="greeting-hello">${greeting()}</div>
          <div class="greeting-name">رفيق القرآن</div>
          <div class="greeting-tagline">رفيقك في كل آية</div>
          <div class="greeting-date">
            <span class="hijri">${hijriDate()}</span>
          </div>
        </div>
        <a class="home-action-btn" href="#/search" aria-label="البحث">${Icons.search}</a>
      </div>

      <!-- Continue Reading HERO CARD (primary visual) -->
      <a class="continue-hero" href="#/quran/${State.getSlice('quran').lastSurah || 1}">
        <div class="hero-label">${Icons.book} أكمل قراءتك</div>
        <div class="hero-surah" id="hero-surah">جارٍ التحميل...</div>
        <div class="hero-ayah-info" id="hero-ayah-info">آية ١ من ٠</div>
        <div class="hero-progress-wrap">
          <div class="hero-progress">
            <div class="hero-progress-bar" id="hero-progress-bar" style="width:0%"></div>
          </div>
        </div>
        <div class="hero-meta">
          <span class="hero-percent" id="hero-percent">٠%</span>
          <span class="hero-cta">
            متابعة القراءة
            ${Icons.chevronLeft}
          </span>
        </div>
      </a>

      <!-- Wurd Card with Progress Ring -->
      <a class="wurd-card" href="#/wird">
        ${renderProgressRing(0, '٠%')}
        <div class="wurd-body">
          <div class="wurd-title">وردي اليوم</div>
          <div class="wurd-sub" id="wurd-sub">لم تبدأ وردك بعد</div>
        </div>
        <div class="wurd-arrow">${Icons.chevronLeft}</div>
      </a>

      <!-- Section: Quick Access -->
      <div class="home-section-label">أدوات القرآن</div>

      <!-- Service Grid -->
      <div class="home-grid">
        <a class="home-tile quran" href="#/quran">
          <div class="tile-icon">${Icons.book}</div>
          <div>
            <div class="tile-title">القرآن</div>
            <div class="tile-sub">اقرأ القرآن الكريم</div>
          </div>
        </a>
        <a class="home-tile reflect" href="#/more/tafsir">
          <div class="tile-icon">${Icons.book}</div>
          <div>
            <div class="tile-title">التفسير</div>
            <div class="tile-sub">افهم معاني الآيات</div>
          </div>
        </a>
        <a class="home-tile remind" href="#/tadabbur">
          <div class="tile-icon">${Icons.reflect}</div>
          <div>
            <div class="tile-title">التدبر</div>
            <div class="tile-sub">تدبر آيات القرآن</div>
          </div>
        </a>
        <a class="home-tile gold" href="#/quran">
          <div class="tile-icon">${Icons.tajweed}</div>
          <div>
            <div class="tile-title">التجويد</div>
            <div class="tile-sub">أحكام التجويد</div>
          </div>
        </a>
        <a class="home-tile quran" href="#/more/favorites">
          <div class="tile-icon">${Icons.bookmark}</div>
          <div>
            <div class="tile-title">المحفوظات</div>
            <div class="tile-sub">الآيات والسور المحفوظة</div>
          </div>
        </a>
        <a class="home-tile reflect" href="#/tadabbur">
          <div class="tile-icon">${Icons.edit}</div>
          <div>
            <div class="tile-title">الخواطر</div>
            <div class="tile-sub">خواطرك حول الآيات</div>
          </div>
        </a>
        <a class="home-tile wird" href="#/more/adhkar">
          <div class="tile-icon">${Icons.adhkar}</div>
          <div>
            <div class="tile-title">الأذكار</div>
            <div class="tile-sub">أذكار المسلم</div>
          </div>
        </a>
        <a class="home-tile gold" href="#/quran/search">
          <div class="tile-icon">${Icons.search}</div>
          <div>
            <div class="tile-title">البحث</div>
            <div class="tile-sub">ابحث داخل القرآن</div>
          </div>
        </a>
      </div>

      <!-- Ayah of the Day -->
      <div id="ayah-card-slot"></div>

      <!-- Quick links -->
      <a class="continue-card gold" href="#/today">
        <div class="continue-icon">${Icons.home}</div>
        <div class="continue-body">
          <div class="continue-title">يومي مع الله</div>
          <div class="continue-sub">ملخص اليوم + عمل خير</div>
        </div>
        <div class="continue-arrow">${Icons.chevronLeft}</div>
      </a>

      <a class="continue-card" href="#/listening">
        <div class="continue-icon">${Icons.speaker}</div>
        <div class="continue-body">
          <div class="continue-title">الاستماع</div>
          <div class="continue-sub">تلاوات القراء مع التتبع</div>
        </div>
        <div class="continue-arrow">${Icons.chevronLeft}</div>
      </a>

      <!-- Prayer card -->
      <div class="prayer-card">
        <div class="prayer-info">
          <div class="prayer-label">الصلاة القادمة</div>
          <div class="prayer-name" id="prayer-name">سيتم إضافته قريبًا</div>
        </div>
        <div class="prayer-time">
          <div class="prayer-countdown" id="prayer-countdown"></div>
        </div>
      </div>

      <div style="height:24px"></div>
    </div>
  `;

  // Async: fill hero card (continue reading)
  try {
    await loadQuran();
    const quranState = State.getSlice('quran');
    const last = quranState.lastSurah || 1;
    const lastAyah = quranState.lastAyah || 1;
    const meta = getSurahMeta(last);
    if (meta) {
      const progress = Math.min(100, Math.round((lastAyah / meta.ayahCount) * 100));
      container.querySelector('#hero-surah').textContent = meta.name;
      container.querySelector('#hero-ayah-info').textContent = `الآية ${toAr(lastAyah)} من ${toAr(meta.ayahCount)}`;
      container.querySelector('#hero-progress-bar').style.width = `${progress}%`;
      container.querySelector('#hero-percent').textContent = `${toAr(progress)}%`;
    }
  } catch (e) {
    console.warn('Hero card fill failed:', e);
    container.querySelector('#hero-surah').textContent = 'سورة الفاتحة';
    container.querySelector('#hero-ayah-info').textContent = 'آية ١ من ٧';
  }

  // Async: fill Wurd card (placeholder for now)
  try {
    // Wurd logic placeholder — could read from State.wird
    const wirdState = State.getSlice('wird');
    if (wirdState && wirdState.plans && wirdState.plans.length > 0) {
      const activePlan = wirdState.plans.find(p => p.id === wirdState.activePlanId) || wirdState.plans[0];
      const progress = activePlan.progress || 0;
      const target = activePlan.target || 1;
      const current = Math.round((progress / target) * 100);
      // Update ring
      const ringEl = container.querySelector('.wurd-progress-ring');
      if (ringEl) {
        const r = 26;
        const c = 2 * Math.PI * r;
        const offset = c - (Math.min(100, current) / 100) * c;
        const fill = ringEl.querySelector('.ring-fill');
        if (fill) fill.setAttribute('stroke-dashoffset', String(offset));
        const text = ringEl.querySelector('.ring-text');
        if (text) text.textContent = `${toAr(current)}%`;
      }
      container.querySelector('#wurd-sub').textContent = `${toAr(progress)} / ${toAr(target)} ${activePlan.type === 'pages' ? 'صفحة' : 'أجزاء'}`;
    } else {
      container.querySelector('#wurd-sub').textContent = 'اضغط لبدء وردك اليومي';
    }
  } catch (e) {
    console.warn('Wurd card fill failed:', e);
  }

  // Async: fill ayah of day
  try {
    const ayah = await getAyahOfDay();
    if (ayah) {
      container.querySelector('#ayah-card-slot').innerHTML = `
        <a class="ayah-card" href="#/quran/${ayah.surah}">
          <div class="ayah-card-label">${Icons.sparkles} آية اليوم</div>
          <div class="ayah-card-text">${ayah.text}</div>
          <div class="ayah-card-ref-wrap">
            <div class="ayah-card-ref">${ayah.surahName} • آية ${toAr(ayah.ayah)}</div>
          </div>
        </a>
      `;
    }
  } catch (e) { console.warn('ayah of day failed', e); }

  // Prayer placeholder
  container.querySelector('#prayer-name').textContent = 'سيتم إضافته قريبًا';
  container.querySelector('#prayer-countdown').textContent = '';
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
