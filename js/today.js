/* =====================================================================
   today.js — ملخص اليوم + يومي مع الله (spec section 28, 51, 50)
   Daily dashboard: wird + hifz + review + prayer + adhkar + tasbeeh + good deed
   ===================================================================== */

import { State, applyTheme } from './state.js';
import { Storage, IDB } from './storage.js';
import { Icons } from '../components/icons.js';
import { loadQuran, getSurahMeta, getAyahText, getSurahs } from './quran/quran-data.js';
import { toast } from '../components/toast.js';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

const GOOD_DEEDS = [
  'بر والديك — اتصال أو زيارة أو دعاء',
  'صلة الرحم — تواصل مع قريب لم تره منذ مدة',
  'الصدقة — ولو بشق تمرة أو مبلغ بسيط',
  'إطعام الطعام — شارك طعامك مع جار أو محتاج',
  'مساعدة محتاج — في حاجة يومية أو عمل',
  'تفريج كربة — عن مسلم في ضيق',
  'الابتسامة في وجه أخيك — صدقة',
  'قراءة القرآن — ولو آيات قليلة',
  'الاستغفار ١٠٠ مرة — تكفير الذنوب',
  'الصلاة على النبي ﷺ — عشر مرات',
  'زيارة مريض — أو السؤال عنه',
  'السلام على من تعرف ومن لا تعرف',
  'كلمة طيبة — اعتذار أو شكر أو ترحيب',
  'إماطة الأذى عن الطريق — صدقة',
  'تعلّم علم نافع — ولو مسألة واحدة',
];

const DASHBOARD_KEY = 'rafiq-dashboard';

function loadDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const data = Storage.get(DASHBOARD_KEY, null);
  if (!data || data.date !== today) {
    // Pick a deterministic good deed for today
    const seed = new Date().getDate();
    const deedIdx = seed % GOOD_DEEDS.length;
    return {
      date: today,
      deed: GOOD_DEEDS[deedIdx],
      deedDone: false,
      items: {
        quran: false,    // قراءة القرآن
        wird: false,     // ورد اليوم
        adhkar: false,   // الأذكار
        prayer: false,   // الصلوات
        tasbeeh: false,  // التسبيح
        tadabbur: false, // تدبر
      },
    };
  }
  return data;
}
function saveDashboard(data) { Storage.set(DASHBOARD_KEY, data); }

export async function renderToday(container) {
  await loadQuran();
  let data = loadDashboard();

  // Get current wird plan status
  const wirdState = State.getSlice('wird');
  const activePlan = wirdState.plans.find(p => p.id === wirdState.activePlanId);
  const todayWird = activePlan ? getTodayWird(activePlan) : null;

  // Get legacy hifz state
  const legacy = Storage.get('rafiq-quran-data', null);
  const hifzToday = legacy?.plan ? getTodayHifz(legacy.plan) : null;

  const items = [
    { id: 'quran',    label: 'قراءة القرآن', icon: Icons.book,    color: 'quran' },
    { id: 'wird',     label: 'الورد',         icon: Icons.wird,    color: 'action', disabled: !activePlan },
    { id: 'adhkar',   label: 'الأذكار',       icon: Icons.adhkar,  color: 'remind' },
    { id: 'prayer',   label: 'الصلوات',       icon: Icons.prayer,  color: 'quran' },
    { id: 'tasbeeh',  label: 'التسبيح',       icon: Icons.tasbeeh, color: 'remind' },
    { id: 'tadabbur', label: 'التدبر',        icon: Icons.reflect, color: 'reflect' },
  ];

  const completedCount = items.filter(i => data.items[i.id]).length;
  const totalPct = Math.round((completedCount / items.length) * 100);

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>يومي مع الله</h2>
        <span class="text-sm text-muted">${toAr(completedCount)}/${toAr(items.length)}</span>
      </div>

      <div class="card card-pad-lg" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div class="text-xs text-muted">تقدم اليوم</div>
        <div class="font-bold text-2xl mt-1" style="color:var(--quran-color)">${toAr(totalPct)}٪</div>
        <div class="mt-3">
          <div class="progress"><div class="progress-bar" style="width:${totalPct}%"></div></div>
        </div>
        <div class="text-xs text-muted mt-2">${toAr(completedCount)} من ${toAr(items.length)} مهام مكتملة</div>
      </div>

      ${totalPct === 100 ? `
        <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,#2F855A 18%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,#2F855A 30%,transparent);margin-bottom:16px">
          <div style="font-size:32px;margin-bottom:8px">${Icons.check}</div>
          <h3 class="h3" style="color:#2F855A">يوم مبارك 🤲</h3>
          <p class="text-muted mt-2" style="font-size:14px">أتممت كل مهام يومك. تقبل الله.</p>
        </div>
      ` : ''}

      <div class="divider-label">مهام اليوم</div>
      <div class="list">
        ${items.map(item => {
          const done = data.items[item.id];
          const bg = item.color === 'quran' ? 'var(--c-blue)' : item.color === 'remind' ? 'var(--c-pink)' : item.color === 'action' ? 'var(--c-cyan)' : 'var(--c-purple)';
          return `
            <button class="row ${done ? 'done-row' : ''} ${item.disabled ? 'disabled' : ''}"
                    data-item="${item.id}"
                    ${item.disabled ? 'aria-disabled="true"' : ''}>
              <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,${bg} 14%,transparent);color:var(--${item.color === 'quran' ? 'quran' : item.color === 'remind' ? 'remind' : item.color === 'action' ? 'action' : 'reflect'}-color);display:flex;align-items:center;justify-content:center">
                ${done ? Icons.check : item.icon}
              </div>
              <div class="row-body">
                <div class="row-title ${done ? 'text-muted line-through' : ''}">${item.label}</div>
                ${item.disabled ? '<div class="row-sub">فعّل خطة ورد من قسم الورد</div>' : ''}
              </div>
              <div class="row-trail">
                ${done ? '<span class="badge" style="background:#2F855A;color:white;border-color:transparent">تم</span>' : ''}
              </div>
            </button>
          `;
        }).join('')}
      </div>

      ${todayWird ? `
        <div class="divider-label">ورد القراءة اليوم</div>
        <a class="card card-pad" href="#/quran/${todayWird.fromSurah}" style="display:block;text-decoration:none;color:inherit">
          <div class="font-quran text-md" style="color:var(--quran-color);line-height:1.8">
            ${escapeHtml(getSurahMeta(todayWird.fromSurah)?.name || '')} • آية ${toAr(todayWird.fromAyah)}
            ${todayWird.toSurah !== todayWird.fromSurah ? `<br>→ ${escapeHtml(getSurahMeta(todayWird.toSurah)?.name || '')} • آية ${toAr(todayWird.toAyah)}` : ` → آية ${toAr(todayWird.toAyah)}`}
          </div>
          <div class="text-xs text-muted mt-2">${Icons.chevronLeft} اضغط لبدء القراءة</div>
        </a>
      ` : ''}

      <div class="divider-label">عمل خير اليوم</div>
      <div class="card card-pad-lg" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-pink) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-pink) 30%,transparent)">
        <div class="text-xs text-muted" style="color:var(--remind-color);font-weight:600">اقتراح اليوم</div>
        <div class="text-md font-semi mt-2" style="line-height:1.7">${escapeHtml(data.deed)}</div>
        <button class="btn ${data.deedDone ? 'btn-outline' : 'btn-remind'} btn-block mt-3" id="deed-done-btn">
          ${data.deedDone ? Icons.check + ' تم' : 'فعِلتها'}
        </button>
      </div>

      <div class="divider-label">آية اليوم للتدبر</div>
      <a class="ayah-card" href="#/quran/${await getAyahOfDaySurah()}">
        <div class="ayah-card-label">${Icons.sparkles} آية اليوم</div>
        <div class="ayah-card-text" id="today-ayah-text">...</div>
        <div class="ayah-card-ref" id="today-ayah-ref"></div>
      </a>

      <div class="card card-pad mt-4" style="background:var(--bg-subtle);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} هذا لوحة تنظيمية فقط — لا حكم ديني. الأهداف لتنظيم يومك وليست معيارًا لإيمانك.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;

  // Wire up toggle items
  container.querySelectorAll('[data-item]').forEach(row => {
    row.onclick = () => {
      const id = row.getAttribute('data-item');
      if (row.classList.contains('disabled')) {
        toast('فعّل خطة ورد أولاً', 'info');
        return;
      }
      data.items[id] = !data.items[id];
      saveDashboard(data);
      renderToday(container);
    };
  });

  // Good deed button
  const deedBtn = container.querySelector('#deed-done-btn');
  if (deedBtn) {
    deedBtn.onclick = () => {
      data.deedDone = !data.deedDone;
      saveDashboard(data);
      if (data.deedDone) toast('تقبل الله 🤲', 'success');
      renderToday(container);
    };
  }

  // Fill ayah of day async
  try {
    const ayah = await getAyahOfDay();
    if (ayah) {
      const textEl = container.querySelector('#today-ayah-text');
      const refEl = container.querySelector('#today-ayah-ref');
      if (textEl) textEl.textContent = ayah.text;
      if (refEl) refEl.textContent = `${ayah.surahName} • آية ${toAr(ayah.ayah)}`;
    }
  } catch (e) { console.warn(e); }
}

function getTodayWird(plan) {
  const today = new Date().toISOString().slice(0, 10);
  const startDate = new Date(plan.startDate + 'T00:00:00');
  const daysElapsed = Math.floor((new Date(today + 'T00:00:00').getTime() - startDate.getTime()) / 86400000) + 1;
  const dayIdx = Math.min(daysElapsed, plan.totalDays) - 1;
  return plan.dayPlans[Math.max(0, dayIdx)];
}

function getTodayHifz(plan) {
  const today = new Date().toISOString().slice(0, 10);
  const t = new Date(today + 'T00:00:00').getTime();
  for (let i = 0; i < plan.days.length; i++) {
    if (new Date(plan.days[i].date + 'T00:00:00').getTime() === t) return plan.days[i];
  }
  return null;
}

let ayahCache = null;
async function getAyahOfDay() {
  if (ayahCache) return ayahCache;
  const surahs = getSurahs();
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const surahIdx = (seed % 110) + 2; // skip Fatiha & Tawba
  const surah = surahs[surahIdx - 1];
  if (!surah) return null;
  const ayahNum = (seed % surah.ayahCount) + 1;
  const text = getAyahText(surah.number, ayahNum);
  ayahCache = { surah: surah.number, ayah: ayahNum, text, surahName: surah.name };
  return ayahCache;
}
async function getAyahOfDaySurah() {
  const a = await getAyahOfDay();
  return a?.surah || 1;
}
