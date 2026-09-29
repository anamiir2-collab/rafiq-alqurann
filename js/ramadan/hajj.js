/* =====================================================================
   hajj.js — الحج والعمرة (spec section 48)
   - Umrah steps
   - Hajj steps
   - Arkam (pillars)
   - Mawaqit (stations)
   - Talbiyah
   - Duas
   - Day-by-day manasik
   ===================================================================== */

import { Icons } from '../../components/icons.js';

export function renderHajj(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الحج والعمرة</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-blue) 18%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
          ${Icons.hajj}
        </div>
        <h3 class="h3">مناسك الحج والعمرة</h3>
        <p class="text-muted mt-2 font-quran" style="font-size:16px;line-height:1.9">
          ﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾
        </p>
        <div class="text-xs text-muted mt-1">سورة البقرة • آية ١٩٦</div>
      </div>

      <div class="divider-label">التلبية</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ
        </div>
        <div class="text-xs text-muted">(متفق عليه — البخاري ١٥٤٩، مسلم ١١٨٤)</div>
      </div>

      <div class="divider-label">خطوات العمرة</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">١</div>
          <div class="row-body"><div class="row-title">الإحرام</div><div class="row-sub">من الميقات، بنية العمرة والتلبية</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">٢</div>
          <div class="row-body"><div class="row-title">الطواف</div><div class="row-sub">٧ أشواط حول الكعبة بدءًا بالحجر الأسود</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">٣</div>
          <div class="row-body"><div class="row-title">الصلاة خلف المقام</div><div class="row-sub">ركعتان خلف مقام إبراهيم</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">٤</div>
          <div class="row-body"><div class="row-title">السعي</div><div class="row-sub">٧ أشواط بين الصفا والمروة</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">٥</div>
          <div class="row-body"><div class="row-title">الحلق أو التقصير</div><div class="row-sub">يحل الإحرام به</div></div>
        </div>
      </div>

      <div class="divider-label">أركان الحج</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">الإحرام</div><div class="row-sub">النية والدخول في النسك</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">الوقوف بعرفة</div><div class="row-sub">«الحج عرفة» (رواه الترمذي ٨٨٩)</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">طواف الإفاضة</div><div class="row-sub">بعد النفر من مزدلفة</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">السعي بين الصفا والمروة</div></div>
        </div>
      </div>

      <div class="divider-label">مناسك الحج — يوم بيوم</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">٨</div>
          <div class="row-body"><div class="row-title">يوم التروية</div><div class="row-sub">٨ ذي الحجة — التوجه إلى منى والمبيت بها</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">٩</div>
          <div class="row-body"><div class="row-title">يوم عرفة</div><div class="row-sub">٩ ذي الحجة — الوقوف بعرفة والدعاء، ثم المبيت بمزدلفة</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">١٠</div>
          <div class="row-body"><div class="row-title">يوم النحر (العيد)</div><div class="row-sub">١٠ ذي الحجة — رمي جمرة العقبة، الذبح، الحلق، طواف الإفاضة</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">١١-١٣</div>
          <div class="row-body"><div class="row-title">أيام التشريق</div><div class="row-sub">رمي الجمرات الثلاث، المبيت بمنى</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--quran-color)">—</div>
          <div class="row-body"><div class="row-title">طواف الوداع</div><div class="row-sub">آخر العهد بالبيت قبل مغادرة مكة</div></div>
        </div>
      </div>

      <div class="divider-label">أدعية الحج</div>
      <div class="card card-pad">
        <div class="text-sm text-muted mb-2">دعاء بين ركن اليماني والحجر الأسود:</div>
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:12px">
          رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
        </div>

        <div class="text-sm text-muted mb-2">دعاء يوم عرفة (أفضل ما قاله النبي ﷺ والنبيون قبله):</div>
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong)">
          لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ
        </div>
        <div class="text-xs text-muted mt-2">(رواه الترمذي ٣٥٨٥ — حسن)</div>
      </div>

      <div class="card card-pad mt-4" style="background:color-mix(in srgb,var(--c-blue) 8%,transparent);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} هذه إرشادات عامة. يُرجى الرجوع إلى الكتب المتخصصة في المناسك والمراجع العلمية الموثوقة لمعرفة التفاصيل الكاملة.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
