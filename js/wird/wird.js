/* =====================================================================
   wird.js — Wird screen (spec section 24, 25) — Phase P3 placeholder
   For now, a clear "coming soon" state explaining the planned feature
   so users understand the screen exists and what's planned.
   ===================================================================== */

import { Icons } from '../../components/icons.js';

export function renderWird(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>ورد اليوم</h2>
      </div>
      <div class="card card-pad-lg text-center" style="padding:48px 24px">
        <div style="width:72px;height:72px;margin:0 auto 16px;border-radius:50%;background:color-mix(in srgb,var(--c-cyan) 18%,transparent);color:var(--action-color);display:flex;align-items:center;justify-content:center">
          ${Icons.wird}
        </div>
        <h3 class="h3 mt-2">قسم الورد قيد التطوير</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7;max-width:380px;margin-inline:auto">
          سيشمل هذا القسم بإذن الله:
        </p>
        <ul class="text-muted mt-3" style="font-size:14px;line-height:2;list-style:none;padding:0;max-width:340px;margin-inline:auto;text-align:right">
          <li>• ورد يومي بالصفحات أو الآيات</li>
          <li>• خطط ختمة (٧ / ١٠ / ١٥ / ٣٠ يومًا)</li>
          <li>• خطة مخصصة حسب المدة</li>
          <li>• متابعة التقدم وحفظ آخر موضع</li>
          <li>• تذكير يومي اختياري</li>
        </ul>
        <a href="#/quran" class="btn btn-primary mt-6">ابدأ القراءة الآن</a>
      </div>

      <div class="section-header mt-8">
        <h3 class="h3">خطط الختمة المقترحة</h3>
      </div>
      <div class="list">
        ${[
          { days: 7,   label: '٧ أيام',    perDay: '≈ ٤٢٠ آية يوميًا', tag: 'مكثّف' },
          { days: 10,  label: '١٠ أيام',   perDay: '≈ ٢٧٠ آية يوميًا', tag: 'مكثّف' },
          { days: 15,  label: '١٥ يومًا',  perDay: '≈ ١٨٠ آية يوميًا', tag: 'متوازن' },
          { days: 30,  label: '٣٠ يومًا',  perDay: '≈ ٨٥ آية يوميًا',  tag: 'مريح' },
        ].map(p => `
          <div class="row" style="cursor:default">
            <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-cyan) 14%,transparent);color:var(--action-color);display:flex;align-items:center;justify-content:center;font-weight:700">
              ${p.label.split(' ')[0]}
            </div>
            <div class="row-body">
              <div class="row-title">ختمة في ${p.label}</div>
              <div class="row-sub">${p.perDay}</div>
            </div>
            <div class="row-trail"><span class="badge badge-action">${p.tag}</span></div>
          </div>
        `).join('')}
      </div>
      <div style="height:32px"></div>
    </div>
  `;
}
