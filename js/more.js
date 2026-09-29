/* =====================================================================
   more.js — "More" screen (spec section 23)
   Scrollable list of all secondary features.
   Spec: "مهم جدًا: لا تختفِ قائمة المزيد. لا تجعل Bottom Navigation يغطي آخر العناصر."
   ===================================================================== */

import { Icons } from '../components/icons.js';

const MORE_ITEMS = [
  // الصلاة و العبادة
  { section: 'الصلاة والعبادة' },
  { label: 'مواقيت الصلاة', icon: Icons.prayer,   path: '/more/prayer',    color: 'quran',  status: 'ready' },
  { label: 'القبلة',          icon: Icons.qibla,    path: '/more/qibla',     color: 'quran',  status: 'ready' },
  { label: 'تعليم الصلاة',    icon: Icons.book,     path: '/more/learn-prayer', color: 'quran', status: 'soon' },
  { label: 'تعليم الوضوء',    icon: Icons.book,     path: '/more/wudu',     color: 'quran',  status: 'soon' },
  { label: 'الاستخارة',       icon: Icons.reflect,  path: '/more/istikhara',color: 'reflect',status: 'soon' },

  // الأذكار والأدعية
  { section: 'الأذكار والأدعية' },
  { label: 'الأذكار',          icon: Icons.adhkar,   path: '/more/adhkar',   color: 'remind', status: 'ready' },
  { label: 'الأدعية',          icon: Icons.dua,      path: '/more/duas',     color: 'remind', status: 'ready' },
  { label: 'المسبحة',          icon: Icons.tasbeeh,  path: '/more/tasbeeh',  color: 'remind', status: 'ready' },

  // المعرفة
  { section: 'المعرفة' },
  { label: 'أسماء الله الحسنى', icon: Icons.names,   path: '/more/names',    color: 'reflect',status: 'ready' },
  { label: 'الأحاديث',          icon: Icons.hadith,  path: '/more/hadith',   color: 'quran',  status: 'ready' },
  { label: 'السيرة النبوية',    icon: Icons.seerah,  path: '/more/seerah',   color: 'reflect',status: 'ready' },
  { label: 'قصص الأنبياء',      icon: Icons.prophets,path: '/more/prophets', color: 'reflect',status: 'ready' },
  { label: 'التفسير',           icon: Icons.book,    path: '/more/tafsir',   color: 'quran',  status: 'ready' },

  // المناسبات
  { section: 'المناسبات والتقويم' },
  { label: 'التقويم الهجري',    icon: Icons.calendar,path: '/more/calendar', color: 'quran',  status: 'ready' },
  { label: 'يوم الجمعة',        icon: Icons.book,    path: '/more/friday',   color: 'quran',  status: 'ready' },
  { label: 'رمضان',             icon: Icons.ramadan, path: '/more/ramadan',  color: 'remind', status: 'ready' },
  { label: 'الحج والعمرة',      icon: Icons.hajj,    path: '/more/hajj',     color: 'quran',  status: 'ready' },
  { label: 'صيام التطوع',       icon: Icons.fasting, path: '/more/fasting',  color: 'remind', status: 'ready' },

  // التطبيق
  { section: 'التطبيق' },
  { label: 'المحفوظات والمفضلة', icon: Icons.bookmark, path: '/more/favorites', color: 'quran', status: 'ready' },
  { label: 'حفظ ومراجعة',        icon: Icons.book,    path: '/hifz',          color: 'quran', status: 'ready' },
  { label: 'الإعدادات',          icon: Icons.settings, path: '/settings',       color: 'quran', status: 'ready' },
  { label: 'المصادر',            icon: Icons.info,     path: '/more/sources',   color: 'quran', status: 'ready' },
  { label: 'عن التطبيق',         icon: Icons.info,     path: '/about',          color: 'quran', status: 'ready' },
];

const COLOR_BG = {
  quran:  'color-mix(in srgb, var(--c-blue) 14%, transparent)',
  remind: 'color-mix(in srgb, var(--c-pink) 18%, transparent)',
  reflect:'color-mix(in srgb, var(--c-purple) 14%, transparent)',
};

export function renderMore(container) {
  const rows = [];
  let lastSection = null;
  for (const item of MORE_ITEMS) {
    if (item.section) {
      rows.push(`<div class="divider-label">${item.section}</div>`);
      lastSection = item.section;
      continue;
    }
    const badge = item.status === 'soon'
      ? `<span class="badge" style="background:var(--bg-subtle);color:var(--fg-subtle);border-color:transparent">قريبًا</span>`
      : '';
    rows.push(`
      <a class="row" href="#${item.path}">
        <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:${COLOR_BG[item.color]};color:var(--${item.color === 'remind' ? 'remind' : item.color === 'reflect' ? 'reflect' : 'quran'}-color);display:flex;align-items:center;justify-content:center">
          ${item.icon}
        </div>
        <div class="row-body">
          <div class="row-title">${item.label}</div>
        </div>
        <div class="row-trail">${badge}${Icons.chevronLeft}</div>
      </a>
    `);
  }

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>المزيد</h2>
      </div>
      <div class="list">${rows.join('')}</div>
      <div style="height:32px"></div>
    </div>
  `;
}
