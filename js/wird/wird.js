/* =====================================================================
   wird.js — Quran Wird (spec section 24, 25)
   Full implementation:
   - Daily wird by pages / verses / duration
   - Khatma plans (7 / 10 / 15 / 30 days + custom)
   - Track progress + last position
   - Continue reading button
   ===================================================================== */

import { State } from '../state.js';
import { Storage, IDB } from '../storage.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';
import { loadQuran, getSurahs, getSurahMeta } from '../quran/quran-data.js';

const WIRDB_STORE = 'wird-progress';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// Juz→Surah:Ayah mapping (standard 30 juz, simplified starting points)
const JUZ_START = [
  { juz: 1,  surah: 1,  ayah: 1 },
  { juz: 2,  surah: 2,  ayah: 142 },
  { juz: 3,  surah: 2,  ayah: 253 },
  { juz: 4,  surah: 3,  ayah: 93 },
  { juz: 5,  surah: 4,  ayah: 24 },
  { juz: 6,  surah: 4,  ayah: 148 },
  { juz: 7,  surah: 5,  ayah: 82 },
  { juz: 8,  surah: 6,  ayah: 111 },
  { juz: 9,  surah: 7,  ayah: 88 },
  { juz: 10, surah: 8,  ayah: 41 },
  { juz: 11, surah: 9,  ayah: 93 },
  { juz: 12, surah: 11, ayah: 6 },
  { juz: 13, surah: 12, ayah: 53 },
  { juz: 14, surah: 15, ayah: 1 },
  { juz: 15, surah: 17, ayah: 1 },
  { juz: 16, surah: 18, ayah: 75 },
  { juz: 17, surah: 21, ayah: 1 },
  { juz: 18, surah: 23, ayah: 1 },
  { juz: 19, surah: 25, ayah: 21 },
  { juz: 20, surah: 27, ayah: 56 },
  { juz: 21, surah: 29, ayah: 46 },
  { juz: 22, surah: 33, ayah: 31 },
  { juz: 23, surah: 36, ayah: 28 },
  { juz: 24, surah: 39, ayah: 32 },
  { juz: 25, surah: 41, ayah: 47 },
  { juz: 26, surah: 46, ayah: 1 },
  { juz: 27, surah: 51, ayah: 31 },
  { juz: 28, surah: 58, ayah: 1 },
  { juz: 29, surah: 67, ayah: 1 },
  { juz: 30, surah: 78, ayah: 1 },
];

const KHATMA_PRESETS = [
  { id: 'k7',  days: 7,  label: '٧ أيام',   perDay: '٤ أجزاء',  juzPerDay: 4, color: 'remind', tag: 'مكثّف' },
  { id: 'k10', days: 10, label: '١٠ أيام',  perDay: '٣ أجزاء',  juzPerDay: 3, color: 'remind', tag: 'مكثّف' },
  { id: 'k15', days: 15, label: '١٥ يومًا', perDay: 'جزءان',     juzPerDay: 2, color: 'action', tag: 'متوازن' },
  { id: 'k30', days: 30, label: '٣٠ يومًا', perDay: 'جزء واحد',  juzPerDay: 1, color: 'quran',  tag: 'مريح' },
];

export async function renderWird(container) {
  await loadQuran();
  const wirdState = State.getSlice('wird');
  const activePlan = wirdState.plans.find(p => p.id === wirdState.activePlanId);

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الورد</h2>
      </div>

      ${activePlan ? renderActivePlan(activePlan) : renderEmpty()}

      <div class="divider-label">خطط الختمة المقترحة</div>
      <div class="list">
        ${KHATMA_PRESETS.map(p => `
          <div class="row" data-plan="${p.id}" style="cursor:pointer">
            <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-${p.color === 'remind' ? 'pink' : p.color === 'action' ? 'cyan' : 'blue'}) 14%,transparent);color:var(--${p.color === 'remind' ? 'remind' : p.color === 'action' ? 'action' : 'quran'}-color);display:flex;align-items:center;justify-content:center;font-weight:700">
              ${toAr(p.days)}
            </div>
            <div class="row-body">
              <div class="row-title">ختمة في ${p.label}</div>
              <div class="row-sub">${p.perDay} يوميًا</div>
            </div>
            <div class="row-trail"><span class="badge badge-${p.color}">${p.tag}</span></div>
          </div>
        `).join('')}
      </div>

      <div class="divider-label">خطة مخصصة</div>
      <div class="card card-pad">
        <div class="label">اختر المدة (أيام)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
          ${[3, 5, 7, 10, 15, 20, 30, 40, 60, 90].map(d => `
            <button class="badge" style="cursor:pointer;padding:8px 14px;font-size:13px" data-custom-days="${d}">${toAr(d)} يوم</button>
          `).join('')}
        </div>
        <button class="btn btn-outline btn-block btn-sm" id="custom-input-btn">أدخل رقمًا مخصصًا</button>
      </div>

      <div class="card card-pad mt-4" style="background:var(--bg-subtle);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} يمكنك تتبع وردك اليومي تلقائيًا. عند فتح أي سورة من القرآن، يُحدّث الوضع تلقائيًا.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;

  // Wire up
  container.querySelectorAll('[data-plan]').forEach(row => {
    row.onclick = () => startKhatma(row.getAttribute('data-plan'));
  });
  container.querySelectorAll('[data-custom-days]').forEach(btn => {
    btn.onclick = () => startCustomPlan(Number(btn.getAttribute('data-custom-days')));
  });
  container.querySelector('#custom-input-btn').onclick = () => {
    const input = prompt('كم عدد الأيام؟');
    const n = parseInt(input || '0', 10);
    if (n >= 1 && n <= 365) startCustomPlan(n);
    else if (input) toast('رقم غير صالح', 'error');
  };

  if (activePlan) {
    const doneBtn = container.querySelector('#wird-done');
    if (doneBtn) doneBtn.onclick = () => markDayDone(activePlan);

    const cancelBtn = container.querySelector('#wird-cancel');
    if (cancelBtn) cancelBtn.onclick = async () => {
      if (!confirm('إلغاء الخطة الحالية؟ لن يتم حذف تقدمك السابق.')) return;
      State.setSlice('wird', { activePlanId: null });
      await IDB.delete(WIRDB_STORE, activePlan.id);
      toast('تم إلغاء الخطة', 'info');
      render();
    };
  }
}

function renderEmpty() {
  return `
    <div class="card card-pad-lg text-center">
      <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-cyan) 18%,transparent);color:var(--action-color);display:flex;align-items:center;justify-content:center">
        ${Icons.wird}
      </div>
      <h3 class="h3">ابدأ وردك اليومي</h3>
      <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
        اختر خطة ختمة من الأسفل أو أنشئ خطة مخصصة.
      </p>
    </div>
  `;
}

function renderActivePlan(plan) {
  const today = new Date().toISOString().slice(0, 10);
  const startDate = new Date(plan.startDate + 'T00:00:00');
  const daysElapsed = Math.floor((new Date(today + 'T00:00:00').getTime() - startDate.getTime()) / 86400000) + 1;
  const dayIdx = Math.min(daysElapsed, plan.totalDays) - 1;
  const todayPlan = plan.dayPlans[Math.max(0, dayIdx)];
  const completedDays = plan.dayPlans.filter(d => d.completed).length;
  const pct = Math.round((completedDays / plan.totalDays) * 100);
  const isTodayDone = todayPlan?.completed;

  return `
    <div class="card card-pad-lg" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-cyan) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-cyan) 30%,transparent);margin-bottom:16px">
      <div class="text-xs text-muted">خطة نشطة</div>
      <div class="font-bold text-md mt-1">ختمة في ${toAr(plan.totalDays)} يومًا</div>
      <div class="text-sm text-muted mt-1">بدأت: ${escapeHtml(formatArabicDate(plan.startDate))}</div>

      <div class="mt-3">
        <div class="text-xs text-muted mb-1">التقدم الكلي</div>
        <div class="progress"><div class="progress-bar action" style="width:${pct}%"></div></div>
        <div class="text-xs text-muted mt-1">${toAr(completedDays)} من ${toAr(plan.totalDays)} يوم (${toAr(pct)}٪)</div>
      </div>
    </div>

    <div class="divider-label">ورد اليوم ${isTodayDone ? '✓' : ''}</div>
    <div class="card card-pad-lg ${isTodayDone ? '' : ''}" style="${isTodayDone ? 'background:color-mix(in srgb,#2F855A 10%,transparent);border-color:color-mix(in srgb,#2F855A 30%,transparent)' : ''}">
      ${isTodayDone ? `
        <div class="text-center">
          <div style="font-size:32px;color:#2F855A;margin-bottom:8px">${Icons.check}</div>
          <div class="font-bold" style="color:#2F855A">أتممت ورد اليوم</div>
          <div class="text-xs text-muted mt-1">تقبل الله منك 🤲</div>
        </div>
      ` : todayPlan ? `
        <div class="text-xs text-muted">اليوم ${toAr(dayIdx + 1)}</div>
        <div class="font-bold text-lg mt-1 font-quran">من ${escapeHtml(getSurahMeta(todayPlan.fromSurah)?.name || '')} آية ${toAr(todayPlan.fromAyah)}</div>
        <div class="text-sm text-muted mt-1">
          ${todayPlan.toSurah !== todayPlan.fromSurah
            ? `إلى ${escapeHtml(getSurahMeta(todayPlan.toSurah)?.name || '')} آية ${toAr(todayPlan.toAyah)}`
            : `إلى آية ${toAr(todayPlan.toAyah)}`}
        </div>
        <a class="btn btn-primary btn-block mt-3" href="#/quran/${todayPlan.fromSurah}">
          ${Icons.book} ابدأ القراءة
        </a>
        <button class="btn btn-outline btn-block mt-2" id="wird-done">
          ${Icons.check} خلصت
        </button>
      ` : `
        <div class="text-center text-muted">
          <p>انتهت الخطة 🎉</p>
        </div>
      `}
    </div>

    <div class="divider-label">خريطة الأيام</div>
    <div class="wird-day-grid">
      ${plan.dayPlans.map((d, i) => `
        <a class="wird-day-chip ${d.completed ? 'done' : ''} ${i === dayIdx ? 'current' : ''}"
           href="#/quran/${d.fromSurah}"
           title="يوم ${toAr(i + 1)}">
          <div class="wird-day-num">${toAr(i + 1)}</div>
          ${d.completed ? '<div class="wird-day-check">' + Icons.check + '</div>' : ''}
        </a>
      `).join('')}
    </div>

    <button class="btn btn-danger btn-sm btn-block mt-4" id="wird-cancel">
      ${Icons.trash} إلغاء الخطة
    </button>
  `;
}

function startKhatma(presetId) {
  const preset = KHATMA_PRESETS.find(p => p.id === presetId);
  if (!preset) return;
  startPlan(preset.days, preset.juzPerDay);
}

function startCustomPlan(days) {
  const juzPerDay = Math.max(1, Math.ceil(30 / days));
  startPlan(days, juzPerDay);
}

function startPlan(totalDays, juzPerDay) {
  const startDate = new Date().toISOString().slice(0, 10);
  const dayPlans = [];

  // Build day plans by juz
  for (let day = 0; day < totalDays; day++) {
    const startJuz = Math.min(30, day * juzPerDay + 1);
    const endJuz = Math.min(30, (day + 1) * juzPerDay);

    const startMeta = JUZ_START[startJuz - 1];
    let endMeta;
    if (endJuz >= 30) {
      endMeta = { surah: 114, ayah: 6 };
    } else {
      endMeta = JUZ_START[endJuz]; // start of next juz = end of current
      endMeta = { surah: endMeta.surah, ayah: Math.max(1, endMeta.ayah - 1) };
    }

    dayPlans.push({
      day: day + 1,
      fromSurah: startMeta.surah, fromAyah: startMeta.ayah,
      toSurah: endMeta.surah, toAyah: endMeta.ayah,
      completed: false,
      completedAt: null,
    });
  }

  const plan = {
    id: `wird_${Date.now()}`,
    type: 'khatma',
    totalDays,
    juzPerDay,
    startDate,
    dayPlans,
    createdAt: new Date().toISOString(),
  };

  const wirdState = State.getSlice('wird');
  wirdState.plans = [...wirdState.plans.filter(p => p.id !== wirdState.activePlanId), plan];
  wirdState.activePlanId = plan.id;
  State.setSlice('wird', wirdState);

  toast(`بدأت ختمة في ${toAr(totalDays)} يومًا 🤲`, 'success');
  setTimeout(() => location.reload(), 600);
}

async function markDayDone(plan) {
  const today = new Date().toISOString().slice(0, 10);
  const startDate = new Date(plan.startDate + 'T00:00:00');
  const daysElapsed = Math.floor((new Date(today + 'T00:00:00').getTime() - startDate.getTime()) / 86400000) + 1;
  const dayIdx = Math.min(daysElapsed, plan.totalDays) - 1;

  if (plan.dayPlans[dayIdx].completed) {
    toast('ورد اليوم مكتمل بالفعل', 'info');
    return;
  }

  plan.dayPlans[dayIdx].completed = true;
  plan.dayPlans[dayIdx].completedAt = new Date().toISOString();

  const wirdState = State.getSlice('wird');
  wirdState.plans = wirdState.plans.map(p => p.id === plan.id ? plan : p);
  State.setSlice('wird', wirdState);

  await IDB.put(WIRDB_STORE, plan);

  const completedCount = plan.dayPlans.filter(d => d.completed).length;
  if (completedCount === plan.totalDays) {
    toast('🎉 أكملت الختمة! تقبل الله', 'success');
  } else {
    toast(`أتممت ورد اليوم (${toAr(completedCount)}/${toAr(plan.totalDays)})`, 'success');
  }

  setTimeout(() => location.reload(), 800);
}

function formatArabicDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const arMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return `${toAr(d.getDate())} ${arMonths[d.getMonth()]} ${toAr(d.getFullYear())}`;
}
