/* =====================================================================
   hijri-calendar.js — التقويم الهجري (spec section 45)
   - Hijri + Gregorian dual display
   - Islamic occasions (Ramadan, Eid, Ashura, Arafah, White Days)
   - Note about crescent-sighting dependency (spec: "وضح أن بعض التواريخ قد تعتمد على رؤية الهلال")
   ===================================================================== */

import { Icons } from '../../components/icons.js';

const ISLAMIC_OCCASIONS = [
  { month: 1,  day: 1,  title: 'رأس السنة الهجرية',    desc: 'بداية العام الهجري' },
  { month: 1,  day: 10, title: 'يوم عاشوراء',          desc: 'يُستحب صيامه. حديث: «صيام يوم عاشوراء، إني أحتسب على الله أن يكفر السنة التي قبله» (مسلم)' },
  { month: 3,  day: 12, title: 'المولد النبوي',         desc: 'ذكرى مولد النبي ﷺ (تختلف بحسب الرؤية)' },
  { month: 7,  day: 27, title: 'ليلة الإسراء والمعراج', desc: 'ذكرى الإسراء والمعراج (تختلف بحسب الروايات)' },
  { month: 8,  day: 15, title: 'ليلة النصف من شعبان',   desc: 'يُكثر فيها الدعاء والاستغفار' },
  { month: 9,  day: 1,  title: 'أول أيام رمضان',        desc: 'شهر الصيام (يعتمد على رؤية الهلال)' },
  { month: 9,  day: 27, title: 'ليلة القدر (الأرجح)',   desc: 'خير من ألف شهر — الترجاها في العشر الأواخر' },
  { month: 10, day: 1,  title: 'عيد الفطر',             desc: 'يبدأ بشوال (يعتمد على رؤية الهلال)' },
  { month: 12, day: 9,  title: 'يوم عرفة',              desc: 'يُستحب صيامه لغير الحاج' },
  { month: 12, day: 10, title: 'عيد الأضحى',            desc: 'يوم النحر — أهل الحج يرمون جمرة العقبة' },
  { month: 12, day: 8,  title: 'يوم التروية',           desc: 'يوم الثامن من ذي الحجة — الحجاج يتجهون إلى منى' },
  { month: 12, day: 9,  title: 'يوم عرفة',              desc: 'أعظم أيام الحج — الوقفة بعرفة' },
];

// White days (أيام البيض) — 13, 14, 15 of every hijri month
function isWhiteDay(day) { return day >= 13 && day <= 15; }

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }

function getHijri(date) {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });
    const parts = fmt.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day').value, 10);
    const month = parseInt(parts.find(p => p.type === 'month').value, 10);
    const year = parseInt(parts.find(p => p.type === 'year').value, 10);
    return { day, month, year };
  } catch { return null; }
}

function getHijriArabic(date) {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  } catch { return ''; }
}

function getGregorianArabic(date) {
  const arMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return `${toAr(date.getDate())} ${arMonths[date.getMonth()]} ${toAr(date.getFullYear())}`;
}

const AR_DAYS = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

export function renderCalendar(container) {
  const today = new Date();
  const hijri = getHijri(today);
  const todayOccasions = hijri ? ISLAMIC_OCCASIONS.filter(o => o.month === hijri.month && o.day === hijri.day) : [];

  // Find upcoming occasions (next 30 days)
  const upcoming = [];
  if (hijri) {
    for (let i = 1; i <= 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const h = getHijri(d);
      if (!h) continue;
      const occ = ISLAMIC_OCCASIONS.find(o => o.month === h.month && o.day === h.day);
      if (occ) upcoming.push({ date: d, hijri: h, ...occ });
      if (upcoming.length >= 6) break;
    }
  }

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>التقويم الهجري</h2>
      </div>

      <div class="cal-today card card-pad-lg text-center">
        <div class="cal-day-name">${AR_DAYS[today.getDay()]}</div>
        <div class="cal-hijri font-quran">${getHijriArabic(today)} هـ</div>
        <div class="cal-gregorian text-muted">${getGregorianArabic(today)} م</div>

        ${todayOccasions.length > 0 ? `
          <div class="cal-occasion-banner">
            ${todayOccasions.map(o => `
              <div class="cal-occasion-title">${Icons.sparkles} ${escapeHtml(o.title)}</div>
              <div class="cal-occasion-desc">${escapeHtml(o.desc)}</div>
            `).join('')}
          </div>
        ` : hijri && isWhiteDay(hijri.day) ? `
          <div class="cal-occasion-banner">
            <div class="cal-occasion-title">${Icons.sparkles} من أيام البيض</div>
            <div class="cal-occasion-desc">يُستحب صيامها. حديث: «صيام ثلاثة أيام من كل شهر صيام الدهر كله» (متفق عليه)</div>
          </div>
        ` : ''}
      </div>

      <div class="divider-label">أيام البيض هذا الشهر</div>
      <div class="card card-pad">
        <div class="text-sm text-muted" style="line-height:1.7">
          يُستحب صيام الأيام الثلاثة البيض: ١٣ و١٤ و١٥ من كل شهر هجري.
          ${hijri ? `<br>في ${HIJRI_MONTHS[hijri.month - 1]} ${toAr(hijri.year)} هـ تقع في الأيام القادمة.` : ''}
        </div>
      </div>

      <div class="divider-label">المناسبات القادمة</div>
      <div class="list">
        ${upcoming.length === 0 ? `
          <div class="empty-state" style="padding:32px 16px">
            <div class="empty-state-icon">${Icons.calendar}</div>
            <div class="empty-state-title">لا توجد مناسبات قريبة</div>
          </div>
        ` : upcoming.map(o => `
          <div class="row">
            <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center;font-weight:700">
              ${toAr(o.hijri.day)}
            </div>
            <div class="row-body">
              <div class="row-title">${escapeHtml(o.title)}</div>
              <div class="row-sub line-clamp-2">${escapeHtml(o.desc)}</div>
              <div class="row-sub" style="margin-top:4px">${toAr(o.hijri.day)} ${HIJRI_MONTHS[o.hijri.month - 1]} ${toAr(o.hijri.year)} هـ</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card card-pad mt-4" style="background:color-mix(in srgb,var(--c-blue) 8%,transparent);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} تنبيه: بعض التواريخ قد تختلف بحسب رؤية الهلال والجهة المعتمدة.
          التقويم هنا يعتمد على حساب أم القرى للإرشاد العام.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
