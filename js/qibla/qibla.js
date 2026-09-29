/* =====================================================================
   qibla.js — القبلة (spec section 36)
   - Compass using DeviceOrientationEvent
   - Direction to Mecca (21.4225°N, 39.8262°E)
   - Calibration notice
   - Fallback: show static direction if no compass
   ===================================================================== */

import { Storage } from '../storage.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const SETTINGS_KEY = 'rafiq-qibla-location';

function loadLoc() { return Storage.get(SETTINGS_KEY, null); }
function saveLoc(l) { Storage.set(SETTINGS_KEY, l); }

function calcQiblaBearing(lat, lng) {
  const φ1 = lat * Math.PI / 180;
  const φ2 = KAABA_LAT * Math.PI / 180;
  const Δλ = (KAABA_LNG - lng) * Math.PI / 180;
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  let θ = Math.atan2(y, x) * 180 / Math.PI;
  return (θ + 360) % 360;
}

function calcDistance(lat, lng) {
  // Haversine
  const R = 6371;
  const φ1 = lat * Math.PI / 180;
  const φ2 = KAABA_LAT * Math.PI / 180;
  const Δφ = (KAABA_LAT - lat) * Math.PI / 180;
  const Δλ = (KAABA_LNG - lng) * Math.PI / 180;
  const a = Math.sin(Δφ/2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }

export function renderQibla(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>القبلة</h2>
      </div>
      <div id="qibla-content"></div>
      <div style="height:32px"></div>
    </div>
  `;
  const content = container.querySelector('#qibla-content');

  let loc = loadLoc();
  if (!loc) {
    promptLocation(content);
    return;
  }
  renderCompass(content, loc);
}

function promptLocation(content) {
  content.innerHTML = `
    <div class="card card-pad-lg text-center">
      <div style="margin-bottom:16px">${Icons.qibla}</div>
      <h3 class="h3">حدد موقعك</h3>
      <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
        نحتاج موقعك لتحديد اتجاه القبلة بدقة.<br>
        البيانات محلية على جهازك فقط.
      </p>
      <button class="btn btn-primary mt-4" id="geo-btn">${Icons.prayer} السماح بتحديد الموقع</button>
    </div>
  `;
  content.querySelector('#geo-btn').onclick = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        saveLoc(loc);
        renderCompass(content, loc);
      },
      () => toast('تعذر الوصول للموقع', 'error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
}

function renderCompass(content, loc) {
  const qiblaBearing = calcQiblaBearing(loc.lat, loc.lng);
  const distance = calcDistance(loc.lat, loc.lng);

  content.innerHTML = `
    <div class="qibla-compass-wrap">
      <div class="qibla-compass" id="qibla-compass">
        <div class="qibla-needle" id="qibla-needle">
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <circle cx="100" cy="100" r="95" fill="none" stroke="var(--border-strong)" stroke-width="1" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="var(--hairline)" stroke-width="1" />
            <text x="100" y="20" text-anchor="middle" font-size="14" fill="var(--fg-muted)" font-weight="700">N</text>
            <text x="100" y="190" text-anchor="middle" font-size="14" fill="var(--fg-muted)" font-weight="700">S</text>
            <text x="190" y="105" text-anchor="middle" font-size="14" fill="var(--fg-muted)" font-weight="700">E</text>
            <text x="10" y="105" text-anchor="middle" font-size="14" fill="var(--fg-muted)" font-weight="700">W</text>
            <!-- Kaaba icon -->
            <g transform="translate(100,100)">
              <rect x="-22" y="-22" width="44" height="44" fill="var(--fg-strong)" rx="3"/>
              <rect x="-22" y="-8" width="44" height="6" fill="var(--remind-color)"/>
              <text x="0" y="6" text-anchor="middle" font-size="14" fill="var(--fg-on-color)" font-weight="700">ك</text>
            </g>
          </svg>
        </div>
      </div>
      <div class="qibla-info">
        <div class="qibla-bearing">
          <div class="qibla-bearing-label">اتجاه القبلة</div>
          <div class="qibla-bearing-value">${toAr(Math.round(qiblaBearing))}°</div>
          <div class="qibla-bearing-sub">من الشمال</div>
        </div>
        <div class="qibla-distance">
          <div class="qibla-bearing-label">المسافة إلى الكعبة</div>
          <div class="qibla-bearing-value">${toAr(distance)}</div>
          <div class="qibla-bearing-sub">كيلومتر</div>
        </div>
      </div>
      <div class="qibla-status" id="qibla-status">
        <div class="text-sm text-muted">اضغط لتفعيل البوصلة</div>
        <button class="btn btn-primary mt-3" id="enable-compass">${Icons.qibla} تفعيل البوصلة الحية</button>
      </div>
      <div class="qibla-calibrate hidden" id="qibla-calibrate">
        <div class="text-xs text-muted text-center">
          ${Icons.info} لمعايرة البوصلة: حرّك جهازك بحركة ٨ في الهواء عدة مرات
        </div>
      </div>
    </div>
  `;

  // Initial needle orientation (just static qibla bearing from north)
  const needle = content.querySelector('#qibla-needle');
  needle.style.transform = `rotate(${qiblaBearing}deg)`;

  // Try to enable live compass
  const enableBtn = content.querySelector('#enable-compass');
  const status = content.querySelector('#qibla-status');

  enableBtn.onclick = async () => {
    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') {
          toast('تم رفض إذن البوصلة', 'error');
          return;
        }
      } catch (e) {
        toast('تعذر طلب الإذن', 'error');
        return;
      }
    }

    if (!('DeviceOrientationEvent' in window)) {
      status.innerHTML = `
        <div class="card card-pad text-center" style="background:var(--bg-subtle);border-color:transparent">
          <div class="text-sm text-muted">
            جهازك لا يدعم البوصلة الحية.<br>
            استخدم اتجاه القبلة أعلاه (${toAr(Math.round(qiblaBearing))}° من الشمال) مع بوصلة يدوية.
          </div>
        </div>`;
      return;
    }

    let calibrated = false;
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);

    status.innerHTML = `
      <div class="card card-pad text-center" style="background:color-mix(in srgb,var(--c-cyan) 14%,transparent);border-color:color-mix(in srgb,var(--c-cyan) 30%,transparent)">
        <div class="text-sm font-semi">البوصلة مفعّلة</div>
        <div class="text-xs text-muted mt-1" id="compass-reading">حرّك جهازك...</div>
      </div>`;
    content.querySelector('#qibla-calibrate').classList.remove('hidden');

    function handler(e) {
      let heading = e.webkitCompassHeading || e.alpha || 0;
      if (e.webkitCompassHeading) {
        // iOS: already in degrees from north
      } else if (e.alpha != null) {
        // Android: alpha is 0-360 counter-clockwise from north
        heading = 360 - e.alpha;
      }

      if (!calibrated && (heading === 0 || heading == null)) {
        const reading = content.querySelector('#compass-reading');
        if (reading) reading.textContent = 'حرّك جهازك لمعايرة البوصلة...';
        return;
      }
      calibrated = true;
      const reading = content.querySelector('#compass-reading');
      if (reading) reading.textContent = `اتجاه الجهاز: ${toAr(Math.round(heading))}°`;

      // Rotate the whole compass dial to match device heading,
      // so the kaaba (qibla) needle stays pointing at the right absolute direction.
      const compass = content.querySelector('#qibla-compass');
      compass.style.transform = `rotate(${-heading}deg)`;
    }
  };
}
