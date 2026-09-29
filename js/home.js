/* =====================================================================
   home.js v3 — Premium iPhone-style Dashboard
   - Compact greeting with hijri date
   - Ayah of the Day hero card
   - Continue reading card (with progress)
   - Service grid (4 tiles)
   - Prayer card (compact)
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
  // Pick a meaningful short surah from middle of Quran (avoids 1, 2, 9 edge cases for display)
  const surahIdx = (seed % 110) + 2; // 2..111 (skip Fatiha & Tawba to avoid bismillah issues)
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

export async function renderHome(container) {
  const user = State.getSlice('user');
  const name = user?.name || 'يا صاحب القرآن';

  container.innerHTML = `
    <div class="page container-app">
      <div class="home-greeting">
        <div class="greeting-text">
          <div class="greeting-hello">${greeting()}</div>
          <div class="greeting-name">${escapeHtml(name)}</div>
          <div class="greeting-date">
            <span class="hijri">${hijriDate()}</span>
          </div>
        </div>
        <a class="home-action-btn" href="#/search" aria-label="البحث">${Icons.search}</a>
      </div>

      <!-- Ayah of the Day — Hero card -->
      <div id="ayah-card-slot">
        <a class="ayah-card" href="#/quran/1">
          <div class="ayah-card-label">${Icons.sparkles} آية اليوم</div>
          <div class="ayah-card-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <div class="ayah-card-ref-wrap">
            <div class="ayah-card-ref">الفاتحة • آية ١</div>
          </div>
        </a>
      </div>

      <!-- Continue Reading — primary CTA card -->
      <a class="continue-card quran" href="#/quran/${State.getSlice('quran').lastSurah || 1}">
        <div class="continue-icon">${Icons.book}</div>
        <div class="continue-body">
          <div class="continue-title">متابعة القراءة</div>
          <div class="continue-sub" id="continue-sub">جارٍ التحميل...</div>
          <div class="continue-progress"><div class="continue-progress-bar" id="continue-progress" style="width:0"></div></div>
        </div>
        <div class="continue-arrow">${Icons.chevronLeft}</div>
      </a>

      <!-- Service Grid (4 tiles) -->
      <div class="home-grid">
        <a class="home-tile wird" href="#/wird">
          <div class="tile-icon">${Icons.wird}</div>
          <div>
            <div class="tile-title">ورد اليوم</div>
            <div class="tile-sub">خطة قراءة يومية</div>
          </div>
        </a>
        <a class="home-tile remind" href="#/more/adhkar">
          <div class="tile-icon">${Icons.adhkar}</div>
          <div>
            <div class="tile-title">الأذكار</div>
            <div class="tile-sub">الصباح والمساء</div>
          </div>
        </a>
        <a class="home-tile reflect" href="#/tadabbur">
          <div class="tile-icon">${Icons.reflect}</div>
          <div>
            <div class="tile-title">التدبر</div>
            <div class="tile-sub">خواطر وتأمل</div>
          </div>
        </a>
        <a class="home-tile gold" href="#/hifz">
          <div class="tile-icon">${Icons.book}</div>
          <div>
            <div class="tile-title">حفظ ومراجعة</div>
            <div class="tile-sub">محفوظاتك وخطتك</div>
          </div>
        </a>
      </div>

      <!-- Quick links — refined cards -->
      <a class="continue-card reflect" href="#/search">
        <div class="continue-icon">${Icons.search}</div>
        <div class="continue-body">
          <div class="continue-title">البحث الشامل</div>
          <div class="continue-sub">القرآن • الأدعية • الأحاديث • الأسماء</div>
        </div>
        <div class="continue-arrow">${Icons.chevronLeft}</div>
      </a>

      <a class="continue-card" href="#/today">
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

  // Async: fill ayah of day + continue sub + prayer
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

  // Continue sub + progress
  try {
    await loadQuran();
    const quranState = State.getSlice('quran');
    const last = quranState.lastSurah || 1;
    const lastAyah = quranState.lastAyah || 1;
    const meta = getSurahMeta(last);
    if (meta) {
      const progress = Math.min(100, Math.round((lastAyah / meta.ayahCount) * 100));
      container.querySelector('#continue-sub').textContent = `سورة ${meta.name} • آية ${toAr(lastAyah)}`;
      container.querySelector('#continue-progress').style.width = `${progress}%`;
    }
  } catch {}

  // Prayer placeholder (full prayer module is later phase)
  container.querySelector('#prayer-name').textContent = 'سيتم إضافته قريبًا';
  container.querySelector('#prayer-countdown').textContent = '';
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
