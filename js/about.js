/* =====================================================================
   about.js — صفحة عن التطبيق (spec section 102)
   ===================================================================== */

import { Icons } from '../components/icons.js';

export function renderAbout(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>عن التطبيق</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div style="width:80px;height:80px;margin:0 auto 16px;border-radius:20px;background:linear-gradient(135deg,var(--c-blue),var(--c-cyan));display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--font-quran);font-size:36px;font-weight:700;box-shadow:var(--shadow-blue)">ر ق</div>
        <h3 class="h2">رفيق القرآن</h3>
        <div class="text-sm text-muted mt-1">Quran Companion</div>
        <div class="badge badge-quran mt-3">الإصدار ٢٫٠</div>
      </div>

      <div class="card card-pad">
        <div class="text-md" style="line-height:1.8">
          تطبيق إسلامي هادئ واحترافي، يجمع بين:
        </div>
        <ul class="text-sm mt-3" style="line-height:2;padding-inline-start:20px">
          <li>القرآن الكريم (١١٤ سورة، نص عثماني)</li>
          <li>التجويد (تلوين الأحكام آليًا)</li>
          <li>البحث في القرآن</li>
          <li>تلاوات ١٢ قارئًا موثوقًا</li>
          <li>مواقيت الصلاة + القبلة</li>
          <li>الأذكار + الأدعية + المسبحة</li>
          <li>أسماء الله الحسنى</li>
          <li>التقويم الهجري</li>
          <li>السيرة النبوية + قصص الأنبياء</li>
          <li>أعمال الجمعة + رمضان + الحج + الصيام</li>
          <li>التدبر والخواطر الشخصية</li>
        </ul>
      </div>

      <div class="divider-label">الأولوية</div>
      <div class="card card-pad text-center">
        <div class="font-quran" style="font-size:20px;color:var(--fg-strong);line-height:1.6">
          القرآن ← الورد ← الحفظ ← التدبر ← الأذكار ← الصلاة ← بقية أدوات المسلم
        </div>
      </div>

      <div class="divider-label">المبادئ</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">Quran-first</div><div class="row-sub">القرآن قلب التطبيق</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">هادئ واحترافي</div><div class="row-sub">لا إزعاج، لا نقاط مزعجة</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">Local-first</div><div class="row-sub">كل البيانات على جهازك</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">Offline-first</div><div class="row-sub">يعمل بدون إنترنت بعد أول تحميل</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">لا AI في المحتوى الشرعي</div><div class="row-sub">القرآن والحديث من مصادرها الأصلية</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">مفتوح المصدر</div><div class="row-sub">GitHub Pages compatible</div></div>
        </div>
      </div>

      <div class="divider-label">التقنيات</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.9">
          <span class="badge badge-quran">Vanilla JS</span>
          <span class="badge badge-action">ES Modules</span>
          <span class="badge badge-remind">PWA</span>
          <span class="badge badge-reflect">Service Worker</span>
          <span class="badge badge-quran">IndexedDB</span>
          <span class="badge badge-action">CSS Variables</span>
        </div>
        <div class="text-xs text-muted mt-3">
          لا build step — ملفات static فقط. يعمل على أي host ثابت (GitHub Pages، Netlify، Vercel...).
        </div>
      </div>

      <div class="divider-label">المساهمة</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          هذا التطبيق مفتوح للتحسين. إذا وجدت خطأً أو لديك اقتراح، شاركنا على GitHub.
        </div>
        <a href="https://github.com/anamiir2-collab/rafiq-alquran" target="_blank" rel="noopener" class="btn btn-outline btn-block mt-3">
          ${Icons.info} صفحة المشروع على GitHub
        </a>
      </div>

      <div class="card card-pad mt-4" style="text-align:center;background:var(--bg-subtle);border-color:transparent">
        <div class="font-quran text-lg" style="color:var(--quran-color);line-height:1.8">
          ﴿ وَقُلْ رَبِّ زِدْنِي عِلْمًا ﴾
        </div>
        <div class="text-xs text-muted mt-2">سورة طه • آية ١١٤</div>
      </div>

      <div class="text-xs text-muted text-center mt-6" style="line-height:1.7">
        Created by Amir Anwar<br>
        <span class="text-subtle">v2.0 — ${new Date().getFullYear()}</span>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
