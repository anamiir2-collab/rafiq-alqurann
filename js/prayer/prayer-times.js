/* =====================================================================
   prayer-times.js — مواقيت الصلاة (spec section 34)
   - Uses Aladhan API (https://aladhan.com/prayer-times-api) — free, no key, CORS-enabled
   - Methods: MWL, ISNA, Egypt, Makkah, Karachi, Umm al-Qura, Dubai, Kuwait, Qatar
   - Auto location via geolocation (with permission)
   - Manual city selection
   - Countdown to next prayer
   - Hijri date integration
   ===================================================================== */

import { Storage } from '../storage.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';

const API_BASE = 'https://api.aladhan.com/v1/timings';

const CALC_METHODS = [
  { id: 2,  name: 'الاتحاد الإسلامي لأمريكا الشمالية (ISNA)' },
  { id: 3,  name: 'رابطة العالم الإسلامي (MWL)' },
  { id: 4,  name: 'مكة المكرمة (أم القرى)' },
  { id: 5,  name: 'الهيئة المصرية العامة للمساحة' },
  { id: 8,  name: 'دولة الإمارات - دبي' },
  { id: 9,  name: 'الكويت' },
  { id: 10, name: 'قطر' },
  { id: 1,  name: 'كراجي - جامعة العلوم الإسلامية' },
  { id: 12, name: 'فرنسا - UOIF' },
  { id: 13, name: 'تركيا - Diyanet' },
  { id: 0,  name: 'افتراضي - الشافعي' },
];

const PRAYER_NAMES = {
  Fajr:    { ar: 'الفجر',    icon: 'sunrise' },
  Sunrise: { ar: 'الشروق',   icon: 'sun' },
  Dhuhr:   { ar: 'الظهر',    icon: 'sun' },
  Asr:     { ar: 'العصر',    icon: 'sun' },
  Maghrib: { ar: 'المغرب',   icon: 'sunset' },
  Isha:    { ar: 'العشاء',   icon: 'moon' },
};

const SETTINGS_KEY = 'rafiq-prayer-settings';
const CACHE_KEY = 'rafiq-prayer-cache';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }

function loadSettings() {
  return Storage.get(SETTINGS_KEY, {
    method: 4,                // default: Umm al-Qura
    location: null,           // { lat, lng, label }
    manualCity: '',           // optional city name
  });
}
function saveSettings(s) { Storage.set(SETTINGS_KEY, s); }

function loadCache() {
  const today = new Date().toISOString().slice(0, 10);
  const c = Storage.get(CACHE_KEY, null);
  if (!c || c.date !== today) return null;
  return c;
}
function saveCache(data) {
  Storage.set(CACHE_KEY, { date: new Date().toISOString().slice(0, 10), ...data });
}

function hijriDate() {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());
  } catch { return ''; }
}

function gregorianDate() {
  const d = new Date();
  const arMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return `${toAr(d.getDate())} ${arMonths[d.getMonth()]} ${toAr(d.getFullYear())}`;
}

function to12h(time24) {
  if (!time24) return '';
  const [hStr, m] = time24.split(':');
  let h = parseInt(hStr, 10);
  const period = h < 12 ? 'ص' : 'م';
  h = h % 12; if (h === 0) h = 12;
  return `${toAr(h)}:${m} ${period}`;
}

function getNextPrayer(timings) {
  const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const p of order) {
    if (!timings[p]) continue;
    const [h, m] = timings[p].split(':');
    const pMin = parseInt(h) * 60 + parseInt(m);
    if (pMin > nowMin) {
      return { name: p, time: timings[p], diff: pMin - nowMin };
    }
  }
  // After Isha → next is Fajr tomorrow
  const [fh, fm] = (timings.Fajr || '05:00').split(':');
  const fajnMin = parseInt(fh) * 60 + parseInt(fm);
  const tomorrowDiff = (24 * 60 - nowMin) + fajnMin;
  return { name: 'Fajr', time: timings.Fajr, diff: tomorrowDiff, tomorrow: true };
}

function formatCountdown(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${toAr(h)} س ${toAr(m)} د`;
  return `${toAr(m)} د`;
}

export async function renderPrayerTimes(container) {
  const settings = loadSettings();
  const cache = loadCache();

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>مواقيت الصلاة</h2>
        <button class="section-action" id="prayer-settings-btn" aria-label="إعدادات">${Icons.settings}</button>
      </div>

      <div id="prayer-content">
        <div class="empty-state" style="padding:48px 16px">
          <div class="skeleton" style="width:60%;height:24px;margin:0 auto 12px"></div>
          <div class="skeleton" style="width:40%;height:14px;margin:0 auto"></div>
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;

  // Try cache first
  if (cache) {
    renderPrayerData(container, cache.timings, cache.location, settings);
  }

  // Determine location
  let loc = settings.location;
  if (!loc && settings.manualCity) {
    // Use city name to get coords via API
    await fetchByCity(container, settings.manualCity, settings);
    return;
  }
  if (!loc) {
    // Try geolocation
    tryGeolocate(container, settings);
    return;
  }

  // Fetch by coords
  await fetchByCoords(container, loc.lat, loc.lng, loc.label, settings);
}

async function tryGeolocate(container, settings) {
  if (!navigator.geolocation) {
    renderManualPrompt(container, settings, 'المتصفح لا يدعم تحديد الموقع');
    return;
  }
  container.querySelector('#prayer-content').innerHTML = `
    <div class="card card-pad-lg text-center">
      <div style="margin-bottom:16px">${Icons.prayer}</div>
      <h3 class="h3">حدد موقعك</h3>
      <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
        نحتاج موقعك لحساب مواقيت الصلاة بدقة.<br>
        لن نحفظ موقعك على أي خادم — كل البيانات محلية على جهازك.
      </p>
      <button class="btn btn-primary mt-4" id="geo-btn">${Icons.prayer} السماح بتحديد الموقع</button>
      <button class="btn btn-outline mt-2" id="manual-btn">أو اختر مدينة يدويًا</button>
    </div>
  `;

  container.querySelector('#geo-btn').onclick = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = {
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
          label: 'موقعي الحالي',
        };
        const newSettings = { ...settings, location: loc };
        saveSettings(newSettings);
        await fetchByCoords(container, loc.lat, loc.lng, loc.label, newSettings);
      },
      (err) => {
        renderManualPrompt(container, settings, 'تعذر الوصول للموقع — اختر مدينة يدويًا');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };
  container.querySelector('#manual-btn').onclick = () => {
    renderManualPrompt(container, settings, '');
  };
}

function renderManualPrompt(container, settings, msg) {
  const popularCities = [
    'مكة المكرمة', 'المدينة المنورة', 'الرياض', 'جدة', 'القاهرة', 'دبي',
    'بيروت', 'عمّان', 'بغداد', 'دمشق', 'القدس', 'الخرطوم', 'الدوحة',
    'الكويت', 'إسطنبول', 'لندن', 'باريس', 'برلين', 'نيويورك', 'تورنتو',
  ];
  container.querySelector('#prayer-content').innerHTML = `
    <div class="card card-pad-lg">
      ${msg ? `<p class="text-muted text-sm mb-4">${escapeHtml(msg)}</p>` : ''}
      <label class="label">ابحث عن مدينتك</label>
      <input type="text" class="input" id="city-input" placeholder="مثال: القاهرة" list="cities-list" />
      <datalist id="cities-list">
        ${popularCities.map(c => `<option value="${c}">`).join('')}
      </datalist>
      <button class="btn btn-primary btn-block mt-4" id="city-search-btn">${Icons.search} بحث</button>

      <div class="divider-label">مدن مشهورة</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${popularCities.slice(0, 12).map(c => `
          <button class="badge" style="cursor:pointer;padding:8px 14px;font-size:13px" data-city="${c}">${c}</button>
        `).join('')}
      </div>

      <div class="divider-label">طريقة الحساب</div>
      <select class="select" id="method-select">
        ${CALC_METHODS.map(m => `<option value="${m.id}" ${settings.method == m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
      </select>
    </div>
  `;

  const search = async (city) => {
    if (!city || !city.trim()) return;
    const method = parseInt(container.querySelector('#method-select').value, 10) || 4;
    const newSettings = { ...settings, manualCity: city.trim(), method };
    saveSettings(newSettings);
    await fetchByCity(container, city.trim(), newSettings);
  };

  container.querySelector('#city-search-btn').onclick = () => {
    search(container.querySelector('#city-input').value);
  };
  container.querySelector('#city-input').onkeydown = (e) => {
    if (e.key === 'Enter') search(e.target.value);
  };
  container.querySelectorAll('[data-city]').forEach(btn => {
    btn.onclick = () => search(btn.getAttribute('data-city'));
  });
}

async function fetchByCity(container, city, settings) {
  showLoading(container);
  try {
    const url = `${API_BASE}ByCity?city=${encodeURIComponent(city)}&country=&method=${settings.method}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    if (json.code !== 200 || !json.data) throw new Error('Bad response');
    const timings = json.data.timings;
    saveCache({ timings, location: { label: city } });
    renderPrayerData(container, timings, { label: city }, settings);
  } catch (e) {
    console.warn('Prayer fetch failed:', e);
    renderError(container, settings, 'تعذر جلب المواقيت. تحقق من اتصالك بالإنترنت.');
  }
}

async function fetchByCoords(container, lat, lng, label, settings) {
  showLoading(container);
  try {
    const date = new Date().toISOString().slice(0, 2) + '-' +
                 String(new Date().getMonth() + 1).padStart(2, '0') + '-' +
                 new Date().getFullYear();
    const url = `${API_BASE}/${date}?latitude=${lat}&longitude=${lng}&method=${settings.method}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    if (json.code !== 200 || !json.data) throw new Error('Bad response');
    const timings = json.data.timings;
    saveCache({ timings, location: { lat, lng, label } });
    renderPrayerData(container, timings, { lat, lng, label }, settings);
  } catch (e) {
    console.warn('Prayer fetch failed:', e);
    renderError(container, settings, 'تعذر جلب المواقيت. تحقق من اتصالك بالإنترنت.');
  }
}

function showLoading(container) {
  const c = container.querySelector('#prayer-content');
  if (c) {
    c.innerHTML = `
      <div class="empty-state" style="padding:48px 16px">
        <div class="skeleton" style="width:60%;height:24px;margin:0 auto 12px"></div>
        <div class="skeleton" style="width:40%;height:14px;margin:0 auto"></div>
      </div>`;
  }
}

function renderError(container, settings, msg) {
  const c = container.querySelector('#prayer-content');
  if (c) {
    c.innerHTML = `
      <div class="empty-state" style="padding:48px 16px">
        <div class="empty-state-icon">${Icons.alert}</div>
        <div class="empty-state-title">تعذر جلب المواقيت</div>
        <div class="empty-state-text">${escapeHtml(msg)}</div>
        <button class="btn btn-outline mt-4" id="retry-btn">إعادة المحاولة</button>
      </div>`;
    const retry = c.querySelector('#retry-btn');
    if (retry) retry.onclick = () => renderManualPrompt(container, settings, '');
  }
}

function renderPrayerData(container, timings, loc, settings) {
  const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const next = getNextPrayer(timings);
  const nextName = PRAYER_NAMES[next.name]?.ar || next.name;

  const content = container.querySelector('#prayer-content');
  content.innerHTML = `
    <div class="prayer-next card card-pad-lg">
      <div class="prayer-next-label">الصلاة القادمة</div>
      <div class="prayer-next-name">${nextName}</div>
      <div class="prayer-next-time">${to12h(next.time)}${next.tomorrow ? ' (غدًا)' : ''}</div>
      <div class="prayer-next-countdown" id="countdown">بعد ${formatCountdown(next.diff)}</div>
    </div>

    <div class="prayer-location card card-pad mt-4">
      <div class="text-xs text-muted">الموقع</div>
      <div class="font-semi mt-1">${escapeHtml(loc.label || 'موقعي الحالي')}</div>
      <button class="btn btn-outline btn-sm mt-3" id="change-loc-btn">${Icons.refresh} تغيير الموقع</button>
    </div>

    <div class="divider-label">مواقيت اليوم</div>
    <div class="list">
      ${order.map(p => {
        const info = PRAYER_NAMES[p] || { ar: p };
        const isNext = p === next.name;
        return `
          <div class="row" style="${isNext ? 'background:color-mix(in srgb,var(--c-cyan) 10%,transparent)' : ''}">
            <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:${isNext ? 'var(--action-color)' : 'var(--bg-subtle)'};color:${isNext ? 'var(--fg-on-color)' : 'var(--fg-muted)'};display:flex;align-items:center;justify-content:center">
              ${Icons[info.icon] || Icons.prayer}
            </div>
            <div class="row-body">
              <div class="row-title">${info.ar}</div>
              ${isNext ? '<div class="row-sub">القادمة</div>' : ''}
            </div>
            <div class="row-trail font-bold" style="font-variant-numeric:tabular-nums">${to12h(timings[p])}</div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="card card-pad mt-4" style="text-align:center">
      <div class="text-xs text-muted">${gregorianDate()}</div>
      <div class="font-semi mt-1" style="color:var(--quran-color)">${hijriDate()}</div>
    </div>
  `;

  // Live countdown
  const cdEl = container.querySelector('#countdown');
  if (cdEl) {
    const tick = setInterval(() => {
      const cur = getNextPrayer(timings);
      cdEl.textContent = `بعد ${formatCountdown(cur.diff)}`;
      // Stop if container is gone
      if (!document.body.contains(cdEl)) clearInterval(tick);
    }, 30 * 1000); // every 30s
  }

  // Change location
  container.querySelector('#change-loc-btn').onclick = () => {
    const newSettings = { ...settings, location: null, manualCity: '' };
    saveSettings(newSettings);
    renderManualPrompt(container, newSettings, 'اختر مدينة أو استخدم الموقع');
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
