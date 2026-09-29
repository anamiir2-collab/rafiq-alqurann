/* =====================================================================
   more.js v3 — "More" screen with premium card-based sections
   - Card-based list items with icon, title, subtitle, chevron
   - Section dividers
   - Safe area aware (no overlap with bottom nav)
   ===================================================================== */

import { Icons } from '../components/icons.js';

const MORE_ITEMS = [
  // الصلاة والعبادة
  { section: 'الصلاة والعبادة' },
  { label: 'مواقيت الصلاة', sub: 'أوقات الصلوات الخمس', icon: Icons.prayer,   path: '/more/prayer',    color: 'quran' },
  { label: 'القبلة',          sub: 'اتجاه القبلة', icon: Icons.qibla,    path: '/more/qibla',     color: 'quran' },
  { label: 'تعليم الصلاة',    sub: 'خطوة بخطوة', icon: Icons.book,     path: '/more/learn-prayer', color: 'quran' },
  { label: 'تعليم الوضوء',    sub: 'الطهارة الصحيحة', icon: Icons.book,     path: '/more/wudu',     color: 'quran' },
  { label: 'الاستخارة',       sub: 'صلاة الاستخارة', icon: Icons.reflect,  path: '/more/istikhara',color: 'reflect' },

  // الأذكار والأدعية
  { section: 'الأذكار والأدعية' },
  { label: 'الأذكار',          sub: 'الصباح والمساء والنوم', icon: Icons.adhkar,   path: '/more/adhkar',   color: 'remind' },
  { label: 'الأدعية',          sub: 'أدعية من القرآن والسنة', icon: Icons.dua,      path: '/more/duas',     color: 'remind' },
  { label: 'المسبحة',          sub: 'عدّاد التسبيح', icon: Icons.tasbeeh,  path: '/more/tasbeeh',  color: 'remind' },

  // المعرفة
  { section: 'المعرفة' },
  { label: 'أسماء الله الحسنى', sub: '٩٩ اسمًا', icon: Icons.names,   path: '/more/names',    color: 'reflect' },
  { label: 'الأحاديث',          sub: 'من الكتب الستة', icon: Icons.hadith,  path: '/more/hadith',   color: 'quran' },
  { label: 'السيرة النبوية',    sub: 'سيرة المصطفى ﷺ', icon: Icons.seerah,  path: '/more/seerah',   color: 'reflect' },
  { label: 'قصص الأنبياء',      sub: 'قصص النبيين', icon: Icons.prophets,path: '/more/prophets', color: 'reflect' },
  { label: 'التفسير',           sub: 'من المصادر الموثوقة', icon: Icons.book,    path: '/more/tafsir',   color: 'quran' },

  // المناسبات
  { section: 'المناسبات والتقويم' },
  { label: 'التقويم الهجري',    sub: 'تقويم أم القرى', icon: Icons.calendar,path: '/more/calendar', color: 'quran' },
  { label: 'يوم الجمعة',        sub: 'فضائل وسنن', icon: Icons.book,    path: '/more/friday',   color: 'quran' },
  { label: 'رمضان',             sub: 'الشهر الفضيل', icon: Icons.ramadan, path: '/more/ramadan',  color: 'remind' },
  { label: 'الحج والعمرة',      sub: 'مناسك وأدعية', icon: Icons.hajj,    path: '/more/hajj',     color: 'quran' },
  { label: 'صيام التطوع',       sub: 'الأيام المستحبة', icon: Icons.fasting, path: '/more/fasting',  color: 'remind' },

  // أدوات إضافية
  { section: 'أدوات إضافية' },
  { label: 'يومي مع الله',       sub: 'ملخص يومك', icon: Icons.home,    path: '/today',         color: 'quran' },
  { label: 'الاستماع',          sub: 'تلاوات القراء', icon: Icons.speaker, path: '/listening',     color: 'action' },
  { label: 'سمّعلي (تدريب الحفظ)', sub: 'تحفيز وتكرار', icon: Icons.speaker, path: '/sammuali',   color: 'action' },
  { label: 'البحث الشامل',       sub: 'في كل المحتوى', icon: Icons.search,  path: '/search',        color: 'quran' },
  { label: 'الإشعارات',         sub: 'تذكيرات يومية', icon: Icons.info,    path: '/notifications', color: 'remind' },

  // التطبيق
  { section: 'التطبيق' },
  { label: 'المحفوظات والمفضلة', sub: 'الآيات المحفوظة', icon: Icons.bookmark, path: '/more/favorites', color: 'quran' },
  { label: 'حفظ ومراجعة',        sub: 'خطة الحفظ', icon: Icons.book,    path: '/hifz',          color: 'quran' },
  { label: 'الإعدادات',          sub: 'السمة والصوت والقراءة', icon: Icons.settings, path: '/settings',       color: 'quran' },
  { label: 'المصادر',            sub: 'مراجع المحتوى', icon: Icons.info,     path: '/more/sources',   color: 'quran' },
  { label: 'عن التطبيق',         sub: 'معلومات وإصدار', icon: Icons.info,     path: '/about',          color: 'quran' },
];

const COLOR_BG = {
  quran:  'color-mix(in srgb, var(--c-blue) 14%, transparent)',
  remind: 'color-mix(in srgb, var(--c-pink) 18%, transparent)',
  reflect:'color-mix(in srgb, var(--c-purple) 14%, transparent)',
  action: 'color-mix(in srgb, var(--c-cyan) 14%, transparent)',
};

const COLOR_FG = {
  quran:  'var(--quran-color)',
  remind: 'var(--remind-color)',
  reflect:'var(--reflect-color)',
  action: 'var(--action-color)',
};

export function renderMore(container) {
  const rows = [];
  let lastSection = null;
  let sectionCount = 0;

  for (const item of MORE_ITEMS) {
    if (item.section) {
      // Close previous list if any
      if (rows.length > 0 && rows[rows.length - 1].startsWith('<div class="list')) {
        rows.push('</div>');
      }
      rows.push(`<div class="divider-label">${item.section}</div>`);
      rows.push(`<div class="list fade-up" style="animation-delay:${sectionCount * 40}ms">`);
      lastSection = item.section;
      sectionCount++;
      continue;
    }
    rows.push(`
      <a class="row" href="#${item.path}">
        <div class="row-icon" style="width:44px;height:44px;border-radius:var(--radius-md);background:${COLOR_BG[item.color]};color:${COLOR_FG[item.color]};display:flex;align-items:center;justify-content:center">
          ${item.icon}
        </div>
        <div class="row-body">
          <div class="row-title">${item.label}</div>
          ${item.sub ? `<div class="row-sub">${item.sub}</div>` : ''}
        </div>
        <div class="row-trail">${Icons.chevronLeft}</div>
      </a>
    `);
  }
  // Close final list
  if (rows.length > 0 && !rows[rows.length - 1].endsWith('</div>')) {
    rows.push('</div>');
  } else if (rows.length > 0 && rows[rows.length - 1] !== '</div>') {
    rows.push('</div>');
  }

  // Wrap the section lists properly
  // Actually re-do this more cleanly:
  const html = renderCleanList();

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>المزيد</h2>
      </div>
      ${html}
      <div style="height:32px"></div>
    </div>
  `;
}

function renderCleanList() {
  const parts = [];
  let current = [];
  let sectionIdx = 0;

  for (const item of MORE_ITEMS) {
    if (item.section) {
      if (current.length > 0) {
        parts.push(`<div class="list fade-up" style="animation-delay:${sectionIdx * 50}ms">${current.join('')}</div>`);
        current = [];
        sectionIdx++;
      }
      parts.push(`<div class="divider-label">${item.section}</div>`);
    } else {
      current.push(`
        <a class="row" href="#${item.path}">
          <div class="row-icon" style="width:44px;height:44px;border-radius:var(--radius-md);background:${COLOR_BG[item.color]};color:${COLOR_FG[item.color]};display:flex;align-items:center;justify-content:center">
            ${item.icon}
          </div>
          <div class="row-body">
            <div class="row-title">${item.label}</div>
            ${item.sub ? `<div class="row-sub">${item.sub}</div>` : ''}
          </div>
          <div class="row-trail">${Icons.chevronLeft}</div>
        </a>
      `);
    }
  }
  if (current.length > 0) {
    parts.push(`<div class="list fade-up" style="animation-delay:${sectionIdx * 50}ms">${current.join('')}</div>`);
  }
  return parts.join('');
}
