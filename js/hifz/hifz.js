/* =====================================================================
   hifz.js — حفظ ومراجعة القرآن (spec section 26, 27, 28)
   ---------------------------------------------------------------------
   Phase 10: Hifz migration bridge.
   Reads the legacy state from localStorage (key 'rafiq-quran-data')
   that the original app-ui.js used, and displays it in the new design.
   Does NOT modify the legacy state — only reads.
   If no legacy state exists, shows the onboarding/empty state.
   ===================================================================== */

import { Storage } from '../storage.js';
import { State } from '../state.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';
import { getSurahMeta } from '../quran/quran-data.js';
import { loadQuran } from '../quran/quran-data.js';

const LEGACY_KEY = 'rafiq-quran-data';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function loadLegacy() {
  return Storage.get(LEGACY_KEY, null);
}

export async function renderHifz(container) {
  await loadQuran();
  const legacy = loadLegacy();

  if (!legacy || !legacy.user || !legacy.plan) {
    renderEmpty(container);
    return;
  }

  // Compute stats from legacy plan
  const stats = computeStats(legacy.plan);
  const todayIdx = findTodayIndex(legacy.plan);
  const today = legacy.plan.days[todayIdx];

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>حفظ ومراجعة</h2>
        <span class="text-sm text-muted">${escapeHtml(legacy.user.name || '')}</span>
      </div>

      <div class="card card-pad-lg" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div class="text-xs text-muted">المستوى</div>
        <div class="font-bold text-md mt-1">${levelLabel(legacy.user.level)}</div>

        <div class="hifz-stats mt-3">
          <div class="hifz-stat">
            <div class="hifz-stat-num">${toAr(stats.memorizedVerses)}</div>
            <div class="hifz-stat-label">آية محفوظة</div>
          </div>
          <div class="hifz-stat">
            <div class="hifz-stat-num">${toAr(stats.completedDays)}</div>
            <div class="hifz-stat-label">يوم مكتمل</div>
          </div>
          <div class="hifz-stat">
            <div class="hifz-stat-num">${toAr(stats.commitmentRate)}٪</div>
            <div class="hifz-stat-label">الالتزام</div>
          </div>
          <div class="hifz-stat">
            <div class="hifz-stat-num">${toAr(stats.completedSurahs)}</div>
            <div class="hifz-stat-label">سورة مكتملة</div>
          </div>
        </div>

        <div class="mt-4">
          <div class="text-xs text-muted mb-1">التقدم الكلي</div>
          <div class="progress"><div class="progress-bar" style="width:${stats.memorizationProgress}%"></div></div>
          <div class="text-xs text-muted mt-1">${toAr(stats.memorizationProgress)}٪ من ${toAr(stats.totalVerses)} آية</div>
        </div>
      </div>

      ${today ? `
        <div class="divider-label">ورد اليوم</div>
        <div class="card card-pad-lg">
          <div class="text-xs text-muted">${escapeHtml(formatArabicDate(today.date))}</div>
          ${today.isRestDay ? `
            <div class="font-bold text-lg mt-2" style="color:var(--action-color)">يوم راحة 🌿</div>
            <div class="text-sm text-muted mt-1">استراحة من الحفظ الجديد — راجع ما حفظته سابقًا.</div>
          ` : `
            <div class="font-bold text-lg mt-2 font-quran">${escapeHtml(today.surahName)} • آيات ${toAr(today.fromAyah)}-${toAr(today.toAyah)}</div>
            <div class="text-sm text-muted mt-1">${toAr(today.verseCount)} آية • ${statusLabel(today.status)}</div>
            <a class="btn btn-primary btn-block mt-3" href="#/quran/${today.surahNumber}">
              ${Icons.book} اقرأ ورد اليوم
            </a>
          `}
        </div>
      ` : ''}

      <div class="divider-label">الإنجازات</div>
      <div class="list">
        ${(legacy.achievements || []).slice(0, 6).map(a => `
          <div class="row" style="cursor:default">
            <div class="row-icon" style="font-size:20px">${a.unlockedAt ? '🏆' : '🔒'}</div>
            <div class="row-body">
              <div class="row-title">${escapeHtml(a.title)}</div>
              <div class="row-sub">${escapeHtml(a.description)}</div>
            </div>
            <div class="row-trail">
              ${a.unlockedAt ? `<span class="badge badge-quran">مُنجز</span>` : (a.progress ? `<span class="text-xs text-muted">${toAr(a.progress)}٪</span>` : '')}
            </div>
          </div>
        `).join('')}
      </div>

      ${legacy.mistakes && legacy.mistakes.length > 0 ? `
        <div class="divider-label">أخطاء تحتاج مراجعة (${toAr(legacy.mistakes.filter(m => !m.resolved).length)})</div>
        <div class="list">
          ${legacy.mistakes.filter(m => !m.resolved).slice(0, 5).map(m => `
            <a class="row" href="#/quran/${m.surah}">
              <div class="row-icon" style="color:#C53030">${Icons.alert}</div>
              <div class="row-body">
                <div class="row-title font-quran">${escapeHtml(m.surahName)} • آية ${toAr(m.ayah)}</div>
                <div class="row-sub">أخطاء: ${toAr(m.errorCount)} • ثبات: ${toAr(m.stability)}/٥</div>
              </div>
              <div class="row-trail">${Icons.chevronLeft}</div>
            </a>
          `).join('')}
        </div>
      ` : ''}

      <div class="divider-label">خطة الحفظ</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          <div>من: <span class="font-semi">${escapeHtml(getSurahMeta(legacy.plan.config.fromSurah)?.name || '')} آية ${toAr(legacy.plan.config.fromAyah)}</span></div>
          <div class="mt-1">إلى: <span class="font-semi">${escapeHtml(getSurahMeta(legacy.plan.config.toSurah)?.name || '')} آية ${toAr(legacy.plan.config.toAyah)}</span></div>
          <div class="mt-1">المدة: <span class="font-semi">${toAr(legacy.plan.config.totalDays)} يومًا</span></div>
          <div class="mt-1">الورد اليومي: <span class="font-semi">${legacy.plan.config.dailyAmount && legacy.plan.config.dailyAmount !== 'auto' ? toAr(legacy.plan.config.dailyAmount) + ' آية' : 'تلقائي'}</span></div>
        </div>
      </div>

      <div class="card card-pad mt-4" style="background:var(--bg-subtle);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} نظام الحفظ القديم محفوظ بالكامل ويعمل في الخلفية. لإدارة متقدمة (اختبارات، تقييمات، إعادة جدولة)، استخدم النسخة الأصلية من التطبيق.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}

function renderEmpty(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>حفظ ومراجعة</h2>
      </div>

      <div class="card card-pad-lg text-center" style="padding:48px 24px">
        <div style="width:72px;height:72px;margin:0 auto 16px;border-radius:50%;background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
          ${Icons.book}
        </div>
        <h3 class="h3">ابدأ رحلة حفظك</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7;max-width:380px;margin-inline:auto">
          لم تُنشئ خطة حفظ بعد. سيشمل هذا القسم بإذن الله:
        </p>
        <ul class="text-muted mt-3" style="font-size:14px;line-height:2;list-style:none;padding:0;max-width:340px;margin-inline:auto;text-align:right">
          <li>• خطط حفظ مخصصة (سورة/جزء/آيات)</li>
          <li>• توزيع آلي على الأيام</li>
          <li>• أيام راحة أسبوعية</li>
          <li>• اختبارات حفظ وتتبع أخطاء</li>
          <li>• مراجعة وتقييم ذاتي</li>
          <li>• إعادة جدولة الفائت تلقائيًا</li>
          <li>• إنجازات وإحصائيات</li>
        </ul>
        <a href="#/quran" class="btn btn-primary mt-6">${Icons.book} ابدأ بقراءة القرآن</a>
      </div>

      <div class="card card-pad mt-4" style="background:color-mix(in srgb,var(--c-blue) 8%,transparent);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} إذا كنت تستخدم النسخة الأصلية من التطبيق، ستجد خطة الحفظ الخاصة بك محفوظة تلقائيًا عند فتح هذا القسم.
        </div>
      </div>
    </div>
  `;
}

function computeStats(plan) {
  const today = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(today + 'T00:00:00');
  let totalVerses = 0, memorizedVerses = 0, completedDays = 0, completedSurahsSet = new Set();
  let commitmentRate = 0;
  let elapsedNonRest = 0, elapsedDone = 0;

  for (const d of plan.days) {
    if (d.isRestDay) continue;
    totalVerses += d.verseCount || 0;
    if (d.memorizeSession && d.memorizeSession.completed) {
      memorizedVerses += d.memorizeSession.versesMemorized || 0;
      completedDays++;
      const meta = getSurahMeta(d.surahNumber);
      if (meta && d.toAyah >= meta.ayahCount) completedSurahsSet.add(d.surahNumber);
    }
    const dDate = new Date(d.date + 'T00:00:00');
    if (dDate <= todayDate) {
      elapsedNonRest++;
      if (d.status === 'completed' || d.status === 'completed_needs_review') elapsedDone++;
    }
  }
  commitmentRate = elapsedNonRest ? Math.round((elapsedDone / elapsedNonRest) * 100) : 0;
  return {
    totalVerses,
    memorizedVerses,
    completedDays,
    completedSurahs: completedSurahsSet.size,
    memorizationProgress: totalVerses ? Math.round((memorizedVerses / totalVerses) * 100) : 0,
    commitmentRate,
  };
}

function findTodayIndex(plan) {
  const today = new Date().toISOString().slice(0, 10);
  const t = new Date(today + 'T00:00:00').getTime();
  for (let i = 0; i < plan.days.length; i++) {
    if (new Date(plan.days[i].date + 'T00:00:00').getTime() === t) return i;
  }
  for (let i = 0; i < plan.days.length; i++) {
    if (new Date(plan.days[i].date + 'T00:00:00').getTime() > t && !plan.days[i].isRestDay) return i;
  }
  return plan.days.length - 1;
}

function levelLabel(level) {
  return { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }[level] || 'متوسط';
}
function statusLabel(status) {
  return {
    completed: 'مكتمل',
    completed_needs_review: 'يحتاج مراجعة',
    memorized_not_reviewed: 'محفوظ، لم يُراجع',
    needs_test: 'يحتاج اختبار',
    missed: 'فائت',
    rescheduled: 'أُعيد جدولته',
    rest: 'راحة',
    pending: 'لم يبدأ',
  }[status] || 'لم يبدأ';
}
function formatArabicDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const arDays = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const arMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return `${arDays[d.getDay()]}، ${toAr(d.getDate())} ${arMonths[d.getMonth()]} ${toAr(d.getFullYear())}`;
}
