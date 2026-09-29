/* =====================================================================
   settings.js — Settings screen (spec section 58)
   Reading / Audio / Appearance / Notifications / Data / Privacy
   ===================================================================== */

import { State, applyTheme } from '../state.js';
import { Icons } from '../../components/icons.js';
import { RECITERS, DEFAULT_RECITER, setReciter, setSpeed, setAutoplay, setRepeat } from '../audio/audio-player.js';
import { exportAllData, importAllData, Storage } from '../storage.js';
import { toast } from '../../components/toast.js';

export function renderSettings(container) {
  const s = State.get();
  const audio = s.audio;
  const settings = s.settings;

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الإعدادات</h2>
      </div>

      <div class="divider-label">المظهر</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="width:44px;height:44px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
            ${Icons.sun}
          </div>
          <div class="row-body">
            <div class="row-title">السمة</div>
            <div class="row-sub">فاتح / داكن / تلقائي</div>
          </div>
          <div class="row-trail">
            <div class="segmented" id="theme-segmented">
              <button class="segmented-btn ${settings.theme==='light'?'active':''}" data-theme="light">فاتح</button>
              <button class="segmented-btn ${settings.theme==='dark'?'active':''}" data-theme="dark">داكن</button>
              <button class="segmented-btn ${settings.theme==='system'?'active':''}" data-theme="system">تلقائي</button>
            </div>
          </div>
        </div>
      </div>

      <div class="divider-label">القراءة</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
            ${Icons.fontSize}
          </div>
          <div class="row-body">
            <div class="row-title">حجم خط القرآن</div>
            <div class="row-sub">${toAr(s.quran.fontSize || 26)}px</div>
          </div>
          <div class="row-trail">
            <button class="btn-icon" id="font-dec">${Icons.minus}</button>
            <button class="btn-icon" id="font-inc">${Icons.plus}</button>
          </div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
            ${Icons.textSpacing}
          </div>
          <div class="row-body">
            <div class="row-title">تباعد الأسطر</div>
            <div class="row-sub">${toAr(Math.round((s.quran.lineHeight || 2.15) * 10))}</div>
          </div>
          <div class="row-trail">
            <button class="btn-icon" id="line-dec">${Icons.minus}</button>
            <button class="btn-icon" id="line-inc">${Icons.plus}</button>
          </div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
            ${Icons.tajweed}
          </div>
          <div class="row-body">
            <div class="row-title">التجويد</div>
            <div class="row-sub">تلوين أحكام التجويد</div>
          </div>
          <div class="row-trail">
            <label class="switch">
              <input type="checkbox" id="tajweed-toggle" ${s.quran.showTajweed?'checked':''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="divider-label">الصوت</div>
      <div class="list">
        <a class="row" href="#" id="reciter-row">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
            ${Icons.speaker}
          </div>
          <div class="row-body">
            <div class="row-title">القارئ</div>
            <div class="row-sub" id="reciter-name-display">${RECITERS.find(r=>r.id===(audio.reciter||DEFAULT_RECITER))?.name || ''}</div>
          </div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </a>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
            ${Icons.speed}
          </div>
          <div class="row-body">
            <div class="row-title">سرعة التلاوة</div>
            <div class="row-sub">${audio.speed || 1}×</div>
          </div>
          <div class="row-trail">
            <div class="segmented" id="speed-segmented">
              ${[0.75,1,1.25,1.5].map(sp => `<button class="segmented-btn ${audio.speed==sp?'active':''}" data-speed="${sp}">${sp}×</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
            ${Icons.play}
          </div>
          <div class="row-body">
            <div class="row-title">التشغيل التلقائي</div>
            <div class="row-sub">ينتقل للآية التالية</div>
          </div>
          <div class="row-trail">
            <label class="switch">
              <input type="checkbox" id="autoplay-toggle" ${audio.autoplay!==false?'checked':''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="divider-label">البيانات</div>
      <div class="list">
        <button class="row" id="export-btn">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:var(--bg-subtle);color:var(--fg);display:flex;align-items:center;justify-content:center">
            ${Icons.download}
          </div>
          <div class="row-body">
            <div class="row-title">تصدير البيانات</div>
            <div class="row-sub">JSON — محفوظات + خواطر + إعدادات</div>
          </div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </button>
        <button class="row" id="import-btn">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:var(--bg-subtle);color:var(--fg);display:flex;align-items:center;justify-content:center">
            ${Icons.upload}
          </div>
          <div class="row-body">
            <div class="row-title">استيراد البيانات</div>
            <div class="row-sub">من ملف JSON</div>
          </div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </button>
        <button class="row" id="reset-btn" style="color:#C53030">
          <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:rgba(197,48,48,0.1);color:#C53030;display:flex;align-items:center;justify-content:center">
            ${Icons.trash}
          </div>
          <div class="row-body">
            <div class="row-title" style="color:#C53030">حذف جميع البيانات</div>
            <div class="row-sub">لا يمكن التراجع</div>
          </div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </button>
      </div>

      <div style="height:32px"></div>
      <input type="file" id="import-file" accept="application/json" style="display:none">
    </div>
  `;

  wireSettings(container);
}

function wireSettings(container) {
  // Theme - segmented control
  container.querySelectorAll('#theme-segmented .segmented-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      State.setSlice('settings', { theme });
      applyTheme(theme);
      container.querySelectorAll('#theme-segmented .segmented-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Font size
  let { fontSize, lineHeight } = State.getSlice('quran');
  if (!fontSize) fontSize = 26;
  if (!lineHeight) lineHeight = 2.15;
  const updateFont = () => {
    State.setSlice('quran', { fontSize, lineHeight });
    container.querySelector('.row-sub').textContent = `${toAr(fontSize)}px`;
  };
  container.querySelector('#font-inc').onclick = () => { fontSize = Math.min(48, fontSize + 2); updateFont(); };
  container.querySelector('#font-dec').onclick = () => { fontSize = Math.max(16, fontSize - 2); updateFont(); };

  // Reciter
  container.querySelector('#reciter-row').addEventListener('click', (e) => {
    e.preventDefault();
    import('../audio/audio-player.js').then(m => m.openReciterPicker());
  });

  // Speed - segmented control
  container.querySelectorAll('#speed-segmented .segmented-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sp = parseFloat(btn.getAttribute('data-speed'));
      setSpeed(sp);
      container.querySelectorAll('#speed-segmented .segmented-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Update row-sub display
      const rowSub = btn.closest('.row')?.querySelector('.row-sub');
      if (rowSub) rowSub.textContent = `${sp}×`;
    });
  });

  // Autoplay
  container.querySelector('#autoplay-toggle').onchange = (e) => {
    setAutoplay(e.target.checked);
  };

  // Tajweed toggle — actually applies now (phase 6)
  container.querySelector('#tajweed-toggle').onchange = (e) => {
    State.setSlice('quran', { showTajweed: e.target.checked });
    toast(e.target.checked ? 'تم تفعيل التجويد' : 'تم إيقاف التجويد', 'info');
  };

  // Export
  container.querySelector('#export-btn').onclick = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rafiq-alquran-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('تم التصدير', 'success');
  };

  // Import
  const fileInput = container.querySelector('#import-file');
  container.querySelector('#import-btn').onclick = () => fileInput.click();
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const ok = await importAllData(text);
    toast(ok ? 'تم الاستيراد' : 'فشل الاستيراد', ok ? 'success' : 'error');
    if (ok) setTimeout(() => location.reload(), 800);
  };

  // Reset
  container.querySelector('#reset-btn').onclick = () => {
    if (!confirm('هل أنت متأكد؟ سيتم حذف كل البيانات المحلية.')) return;
    State.reset();
    for (const k of Storage.keys()) {
      if (k.startsWith('rafiq-')) Storage.remove(k);
    }
    toast('تم الحذف', 'success');
    setTimeout(() => location.reload(), 800);
  };
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
