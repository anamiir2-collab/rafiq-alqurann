/* =====================================================================
   tasbeeh.js — المسبحة (spec section 33)
   - Multiple dhikr: سبحان الله / الحمد لله / الله أكبر / لا إله إلا الله /
     أستغفر الله / الصلاة على النبي ﷺ / ذكر مخصص
   - Counter (tap or button)
   - Daily goal (optional)
   - Save count to localStorage
   - No competition or annoying points (spec: "بدون منافسة أو نقاط مزعجة")
   ===================================================================== */

import { State } from '../state.js';
import { Storage } from '../storage.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';

const PRESETS = [
  { id: 'subhan',   text: 'سُبْحَانَ ٱللَّه',         goal: 33 },
  { id: 'hamd',     text: 'ٱلْحَمْدُ لِلَّه',           goal: 33 },
  { id: 'akbar',    text: 'ٱللَّهُ أَكْبَر',           goal: 34 },
  { id: 'tahlil',   text: 'لَا إِلَٰهَ إِلَّا ٱللَّه',  goal: 100 },
  { id: 'istighfar',text: 'أَسْتَغْفِرُ ٱللَّه',       goal: 100 },
  { id: 'salah',    text: 'ٱللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ ﷺ', goal: 100 },
];

const STORAGE_KEY = 'rafiq-tasbeeh';
const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }

function loadCounts() {
  const today = new Date().toISOString().slice(0, 10);
  const data = Storage.get(STORAGE_KEY, { date: today, counts: {}, custom: [] });
  if (data.date !== today) {
    // Reset daily counts on new day (but keep custom list)
    return { date: today, counts: {}, custom: data.custom || [] };
  }
  return data;
}

function saveCounts(data) {
  Storage.set(STORAGE_KEY, data);
}

export function renderTasbeeh(container) {
  let data = loadCounts();
  let currentDhikr = PRESETS[0].id;
  let target = PRESETS[0].goal;
  let customMode = false;

  function getCount(id) { return data.counts[id] || 0; }

  function getTotalToday() {
    return Object.values(data.counts).reduce((s, n) => s + n, 0);
  }

  function render() {
    const current = customMode
      ? { id: 'custom', text: data.custom[data.custom.length - 1] || 'ذكر مخصص', goal: target }
      : PRESETS.find(p => p.id === currentDhikr);
    const count = getCount(current.id);
    const pct = current.goal > 0 ? Math.min(100, (count / current.goal) * 100) : 0;
    const cycleCount = current.goal > 0 ? Math.floor(count / current.goal) : 0;

    container.innerHTML = `
      <div class="page container-app">
        <div class="section-header">
          <h2>المسبحة</h2>
          <span class="text-sm text-muted">إجمالي اليوم: ${toAr(getTotalToday())}</span>
        </div>

        <div class="tasbeeh-display card card-pad-lg text-center">
          <div class="tasbeeh-current-dhikr font-quran">${current.text}</div>
          <div class="tasbeeh-count" id="tasbeeh-count">${toAr(count)}</div>
          <div class="tasbeeh-progress">
            <div class="tasbeeh-progress-bar" style="width:${pct}%"></div>
          </div>
          <div class="tasbeeh-meta">
            ${current.goal > 0 ? `الهدف: ${toAr(current.goal)} • دورات مكتملة: ${toAr(cycleCount)}` : 'بدون هدف محدد'}
          </div>
          <button class="tasbeeh-tap" id="tasbeeh-tap" aria-label="عدّ">
            <span>اضغط للعدّ</span>
          </button>
          <div class="tasbeeh-actions">
            <button class="btn btn-outline btn-sm" id="tasbeeh-reset">
              ${Icons.refresh} تصفير
            </button>
          </div>
        </div>

        <div class="divider-label">اختر الذكر</div>
        <div class="list">
          ${PRESETS.map(p => {
            const c = getCount(p.id);
            const active = !customMode && p.id === currentDhikr;
            return `
              <button class="row ${active ? 'active' : ''}" data-dhikr="${p.id}" style="background:${active ? 'var(--bg-subtle)' : ''}">
                <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-cyan) 14%,transparent);color:var(--action-color);display:flex;align-items:center;justify-content:center">
                  ${Icons.tasbeeh}
                </div>
                <div class="row-body">
                  <div class="row-title font-quran" style="font-size:16px">${p.text}</div>
                  <div class="row-sub">الهدف: ${toAr(p.goal)} • اليوم: ${toAr(c)}</div>
                </div>
                <div class="row-trail">${Icons.chevronLeft}</div>
              </button>
            `;
          }).join('')}
          <button class="row" id="tasbeeh-custom-btn">
            <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-purple) 14%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center">
              ${Icons.plus}
            </div>
            <div class="row-body">
              <div class="row-title">ذكر مخصص</div>
              <div class="row-sub">اكتب ذكرك الخاص وحدد هدفك</div>
            </div>
            <div class="row-trail">${Icons.chevronLeft}</div>
          </button>
        </div>

        <div class="card card-pad mt-4" style="background:var(--bg-subtle);border-color:transparent">
          <div class="text-sm text-muted text-center" style="line-height:1.7">
            ﴿ فَٱذْكُرُونِيٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِي وَلَا تَكْفُرُونِ ﴾
            <div class="text-xs text-subtle mt-2">سورة البقرة • آية ١٥٢</div>
          </div>
        </div>

        <div style="height:32px"></div>
      </div>
    `;

    wire();
  }

  function wire() {
    // Tap to count
    container.querySelector('#tasbeeh-tap').onclick = () => {
      const id = customMode ? 'custom' : currentDhikr;
      data.counts[id] = (data.counts[id] || 0) + 1;
      saveCounts(data);

      // Vibrate if supported (mobile)
      if (navigator.vibrate) navigator.vibrate(15);

      // Check goal reached
      const goal = customMode ? target : (PRESETS.find(p => p.id === currentDhikr)?.goal || 0);
      const newCount = data.counts[id];
      if (goal > 0 && newCount % goal === 0) {
        toast(`أتممت ${toAr(goal)} مرة — تقبل الله`, 'success');
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }

      // Update count display without full re-render
      const countEl = container.querySelector('#tasbeeh-count');
      if (countEl) countEl.textContent = toAr(newCount);
      const pct = goal > 0 ? Math.min(100, (newCount / goal) * 100) : 0;
      const bar = container.querySelector('.tasbeeh-progress-bar');
      if (bar) bar.style.width = `${pct}%`;
      const meta = container.querySelector('.tasbeeh-meta');
      if (meta) {
        const cycles = Math.floor(newCount / goal);
        meta.textContent = `الهدف: ${toAr(goal)} • دورات مكتملة: ${toAr(cycles)}`;
      }
      // Update total
      const totalEl = container.querySelector('.section-header .text-sm');
      if (totalEl) totalEl.textContent = `إجمالي اليوم: ${toAr(getTotalToday())}`;
    };

    // Reset current
    container.querySelector('#tasbeeh-reset').onclick = () => {
      if (!confirm('تصفير عداد هذا الذكر؟')) return;
      const id = customMode ? 'custom' : currentDhikr;
      data.counts[id] = 0;
      saveCounts(data);
      render();
    };

    // Preset selection
    container.querySelectorAll('[data-dhikr]').forEach(btn => {
      btn.onclick = () => {
        currentDhikr = btn.getAttribute('data-dhikr');
        customMode = false;
        render();
      };
    });

    // Custom dhikr
    container.querySelector('#tasbeeh-custom-btn').onclick = () => {
      const text = prompt('اكتب الذكر:');
      if (!text || !text.trim()) return;
      const goalStr = prompt('الهدف اليومي (اختياري — اتركه فارغًا):', '100');
      const goal = parseInt(goalStr || '0', 10) || 0;
      data.custom = data.custom || [];
      data.custom.push(text.trim());
      data.counts['custom'] = 0;
      target = goal;
      customMode = true;
      saveCounts(data);
      render();
    };
  }

  render();
}
