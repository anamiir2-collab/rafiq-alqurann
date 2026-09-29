/* =====================================================================
   sources.js — صفحة المصادر (spec section 59)
   List all data sources with references.
   ===================================================================== */

import { Icons } from '../components/icons.js';

export function renderSources(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>المصادر</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-blue) 18%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
          ${Icons.info}
        </div>
        <h3 class="h3">مصادر البيانات</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
          جميع المحتويات الدينية من مصادر موثوقة، مع توثيق المراجع
        </p>
      </div>

      <div class="divider-label">القرآن الكريم</div>
      <div class="card card-pad">
        <div class="font-semi" style="color:var(--quran-color);margin-bottom:4px">النص العثماني</div>
        <div class="text-sm text-muted" style="line-height:1.7">
          مصدر النص: مجموعة بيانات Tanzil (tanzil.net) — مرجع معتمد عالميًا للنص القرآني العثماني.
        </div>
        <div class="font-semi mt-3" style="color:var(--quran-color);margin-bottom:4px">طريقة التحقق</div>
        <div class="text-sm text-muted" style="line-height:1.7">
          تم التحقق آليًا من: ١١٤ سورة، ٦٢٣٦ آية، عدم التكرار، عدم الفقد، الترتيب المتسلسل، سلامة Unicode.
        </div>
        <div class="font-semi mt-3" style="color:var(--quran-color);margin-bottom:4px">ملف البيانات</div>
        <div class="text-xs text-muted" style="font-family:var(--font-mono)">data/quran/quran.json + surahs.json + manifest.json</div>
      </div>

      <div class="divider-label">التجويد</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          أحكام التجويد مكتشفة آليًا من النص العثماني بخوارزمية محلية (لا تعتمد على AI).
          التلوين تشخيصي للتعلّم، ويُنصح بدراسة أحكام التجويد من المصادر المتخصصة:
        </div>
        <ul class="text-sm text-muted mt-2" style="line-height:1.9;padding-inline-start:20px">
          <li>«تحفة الأطفال» للجمزوري</li>
          <li>«المدخل إلى علم التجويد» للشيخ أيمن سويد</li>
        </ul>
      </div>

      <div class="divider-label">الصوت (التلاوات)</div>
      <div class="card card-pad">
        <div class="font-semi" style="color:var(--quran-color);margin-bottom:4px">المصدر</div>
        <div class="text-sm text-muted" style="line-height:1.7">
          islamic.network CDN — ملفات MP3 موثوقة لكل آية لكل قارئ.
        </div>
        <div class="font-semi mt-3" style="color:var(--quran-color);margin-bottom:4px">القراء المتاحون (١٢)</div>
        <div class="text-sm text-muted" style="line-height:1.7">
          المنشاوي (مرتل/مجود)، الحصري (مرتل/مجود)، عبد الباسط (مرتل/مجود)، العفاسي، السديس، الشاطري، المعيقلي، العجمي، الرفاعي.
        </div>
      </div>

      <div class="divider-label">الأحاديث</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          من الكتب الستة (البخاري، مسلم، أبو داود، الترمذي، النسائي، ابن ماجه) والأربعين النووية.
          كل حديث موثق برقمه في المصدر. للأمان العلمي: يُرجى التحقق من نص الحديث من المصدر الأصلي قبل نقله.
        </div>
      </div>

      <div class="divider-label">الأذكار</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          من «حصن المسلم» للشيخ سعيد بن علي القحطاني — compilation معتمدة للأذكار.
          كل ذكر موثق بمصدره من البخاري/مسلم/السنن.
        </div>
      </div>

      <div class="divider-label">الأدعية</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          أدعية قرآنية (من آيات الذكر الحكيم) + أدعية الأنبياء (من القرآن) + أدعية نبوية موثقة.
        </div>
      </div>

      <div class="divider-label">مواقيت الصلاة</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          Aladhan API (aladhan.com) — مجاني ومفتوح بدون مفتاح. يدعم ١١ طريقة حساب.
        </div>
      </div>

      <div class="divider-label">أسماء الله الحسنى</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          ٩٩ اسمًا وفق رواية أبي هريرة رضي الله عنه (رواه الترمذي وابن ماجه).
          المعاني مستوحاة من شروح العلماء كابن القيم وابن تيمية والسعدي.
        </div>
      </div>

      <div class="divider-label">التقويم الهجري</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          يعتمد على تقويم أم القرى (السعودية) عبر Intl.DateTimeFormat.
          بعض المناسبات قد تختلف بحسب رؤية الهلال المحلية.
        </div>
      </div>

      <div class="divider-label">السيرة وقصص الأنبياء</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.7">
          ملخصات موجزة من المصادر الكلاسيكية:
        </div>
        <ul class="text-sm text-muted mt-2" style="line-height:1.9;padding-inline-start:20px">
          <li>«الرحيق المختوم» للمباركفوري</li>
          <li>«زاد المعاد» لابن القيم</li>
          <li>«البداية والنهاية» لابن كثير</li>
          <li>«قصص الأنبياء» لابن كثير</li>
        </ul>
      </div>

      <div class="card card-pad mt-4" style="background:color-mix(in srgb,#C53030 8%,transparent);border-color:transparent">
        <div class="text-xs text-center" style="color:#C53030;line-height:1.7">
          ${Icons.alert} تنبيه: لا يُولّد أي محتوى ديني بواسطة AI. القرآن والحديث والتفسير من مصادرها الأصلية. أي مساعدة من AI تقتصر على التنظيم والبحث والملخصات الإدارية.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
