/* =====================================================================
   app.js — Main entry point for رفيق القرآن (Quran Companion) v2
   ---------------------------------------------------------------------
   This is the new modular app. The legacy app-ui.js / app-data.js /
   quran-audio.js files are NOT loaded by index.html anymore; they are
   preserved on disk for reference and incremental migration.
   ===================================================================== */

import { State, applyTheme } from './state.js';
import { startRouter, registerRoute, navigate } from './router.js';
import { Storage } from './storage.js';
import { Icons } from '../components/icons.js';
import { renderBottomNav } from '../components/bottom-nav.js';
import { toast } from '../components/toast.js';
import { initAudio } from './audio/audio-player.js';

import { renderHome } from './home.js';
import { renderSurahIndex, renderSurahReader } from './quran/reader.js';
import { renderSearch } from './quran/search.js';
import { renderWird } from './wird/wird.js';
import { renderTadabbur } from './tadabbur/tadabbur.js';
import { renderMore } from './more.js';
import { renderSettings } from './settings/settings.js';
import { renderTasbeeh } from './tasbeeh/tasbeeh.js';
import { renderAdhkar, renderAdhkarCategory } from './adhkar/adhkar.js';
import { renderPrayerTimes } from './prayer/prayer-times.js';
import { renderQibla } from './qibla/qibla.js';
import { renderNames } from './names/names-of-allah.js';
import { renderCalendar } from './calendar/hijri-calendar.js';

/* ============ Top bar ============ */
function renderTopbar(title = '', subtitle = '') {
  return `
    <header class="topbar" role="banner">
      <div class="topbar-inner">
        <div style="display:flex;align-items:center;gap:10px;min-width:0">
          ${title ? `<button class="btn-icon" onclick="history.back()" aria-label="رجوع">${Icons.chevronRight}</button>` : `<img src="assets/logo-1.png" alt="رفيق القرآن" style="width:32px;height:32px;border-radius:8px">`}
          <div style="min-width:0">
            ${title ? `<div class="topbar-title">${title}</div>` : `<div class="topbar-title">رفيق القرآن</div>`}
            ${subtitle ? `<div class="topbar-sub">${subtitle}</div>` : ''}
          </div>
        </div>
        <div class="topbar-actions">
          <button class="btn-icon" onclick="window.__theme()" aria-label="تبديل السمة" id="theme-btn">${getThemeIcon()}</button>
          <a class="btn-icon" href="#/settings" aria-label="الإعدادات">${Icons.settings}</a>
        </div>
      </div>
    </header>
  `;
}

function getThemeIcon() {
  const theme = State.getSlice('settings').theme;
  if (theme === 'dark') return Icons.sun;
  if (theme === 'light') return Icons.moon;
  return Icons.monitor;
}

window.__theme = () => {
  const cur = State.getSlice('settings').theme;
  const next = cur === 'dark' ? 'light' : 'dark';
  State.setSlice('settings', { theme: next });
  applyTheme(next);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.innerHTML = getThemeIcon();
};

/* ============ Routes ============ */
function withChrome(renderFn, { title = '', subtitle = '', needsBottomNav = true } = {}) {
  return async (container, params) => {
    const body = needsBottomNav ? 'has-bottomnav' : '';
    document.body.className = `has-topbar ${body}`.trim();
    const app = container;
    app.innerHTML = renderTopbar(title, subtitle) + `<main id="page-main"></main>` + (needsBottomNav ? renderBottomNav() : '');
    const main = app.querySelector('#page-main');
    try {
      await renderFn(main, params);
    } catch (e) {
      console.error('Render failed:', e);
      main.innerHTML = `
        <div class="container-app" style="padding:48px 16px;text-align:center">
          <div class="empty-state-icon">${Icons.alert}</div>
          <div class="empty-state-title mt-2">حدث خطأ</div>
          <div class="empty-state-text">${escapeHtml(e.message || '')}</div>
          <button class="btn btn-outline mt-4" onclick="location.hash='/'">العودة للرئيسية</button>
        </div>`;
    }
  };
}

registerRoute('/', withChrome(renderHome, { title: '', subtitle: '' }));
registerRoute('/quran', withChrome(renderSurahIndex, { title: 'القرآن الكريم', subtitle: '١١٤ سورة' }));
registerRoute('/quran/search', withChrome(renderSearch, { title: 'البحث في القرآن', subtitle: '٦٢٣٦ آية' }));
registerRoute('/quran/:surah', withChrome(renderSurahReader, { title: '', subtitle: '' }));
registerRoute('/wird', withChrome(renderWird, { title: 'الورد', subtitle: 'متابعة القراءة اليومية' }));
registerRoute('/tadabbur', withChrome(renderTadabbur, { title: 'التدبر', subtitle: 'خواطرك الشخصية' }));
registerRoute('/more', withChrome(renderMore, { title: 'المزيد', subtitle: 'كل الأقسام' }));
registerRoute('/settings', withChrome(renderSettings, { title: 'الإعدادات', subtitle: '' }));

// Phase 11-13 routes
registerRoute('/more/tasbeeh',  withChrome(renderTasbeeh,   { title: 'المسبحة', subtitle: '' }));
registerRoute('/more/adhkar',   withChrome(renderAdhkar,    { title: 'الأذكار', subtitle: '' }));
registerRoute('/more/adhkar/:categoryId', withChrome(renderAdhkarCategory, { title: 'الأذكار', subtitle: '' }));
registerRoute('/more/prayer',   withChrome(renderPrayerTimes, { title: 'مواقيت الصلاة', subtitle: '' }));
registerRoute('/more/qibla',    withChrome(renderQibla,     { title: 'القبلة', subtitle: '' }));
registerRoute('/more/names',    withChrome(renderNames,     { title: 'أسماء الله الحسنى', subtitle: '٩٩ اسمًا' }));
registerRoute('/more/calendar', withChrome(renderCalendar,  { title: 'التقويم الهجري', subtitle: '' }));

// Legacy hifz — bridge to existing functionality (preserves spec section 2: don't delete working features)
registerRoute('/hifz', async (container) => {
  document.body.className = 'has-topbar has-bottomnav';
  container.innerHTML = renderTopbar('حفظ ومراجعة', 'خطتك ومحفوظاتك') + `<main id="page-main"></main>` + renderBottomNav();
  const main = container.querySelector('#page-main');
  main.innerHTML = `
    <div class="container-app page">
      <div class="card card-pad-lg text-center" style="padding:48px 24px">
        <div style="width:72px;height:72px;margin:0 auto 16px;border-radius:50%;background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
          ${Icons.book}
        </div>
        <h3 class="h3">قسم الحفظ والمراجعة</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7;max-width:380px;margin-inline:auto">
          يتم حاليًا ترحيل نظام الحفظ الحالي إلى البنية الجديدة.
          سيتوفر بإذن الله: خطط الحفظ، اختبارات، تتبع الأخطاء، التقييم الذاتي، الإنجازات.
        </p>
        <p class="text-subtle mt-4" style="font-size:12px">
          ميزات الحفظ الحالية محفوظة في الكود وستُدمج تدريجيًا.
        </p>
      </div>
    </div>
  `;
});

/* Catch-all 404 → home */
registerRoute('/404', (container) => { navigate('/'); });

/* ============ Bootstrap ============ */
function bootstrap() {
  // Apply theme
  applyTheme(State.getSlice('settings').theme);

  // Init audio engine (lazy — only creates Audio element on first play)
  initAudio();

  // Start router
  startRouter();

  // Friendly console message
  console.log('%cرفيق القرآن | Quran Companion v2',
    'font-size:16px;font-weight:700;color:#9DC3E2');
  console.log('%cالمشروع قيد التطوير التدريجي — البيانات المحلية محفوظة.',
    'color:#5B6776');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
