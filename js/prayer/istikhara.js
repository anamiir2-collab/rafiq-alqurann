/* =====================================================================
   istikhara.js — الاستخارة (spec section 44)
   EDUCATIONAL ONLY. Spec is explicit:
   - "ممنوع: اختيار نتيجة للمستخدم"
   - "ممنوع: استخارة إلكترونية"
   - "ممنوع: إعطاء قرار نيابة عن المستخدم"
   We only teach how to pray it and provide the dua.
   ===================================================================== */

import { Icons } from '../../components/icons.js';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

export function renderIstikhara(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الاستخارة</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-purple) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-purple) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-purple) 18%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center">
          ${Icons.reflect}
        </div>
        <h3 class="h3">صلاة الاستخارة</h3>
        <p class="text-muted mt-2 font-quran" style="font-size:14px;line-height:1.9">
          «إِذَا هَمَّ أَحَدُكُمْ بِالْأَمْرِ فَلْيَرْكَعْ رَكْعَتَيْنِ مِنْ غَيْرِ الْفَرِيضَةِ...»
        </p>
        <div class="text-xs text-muted mt-2">رواه البخاري ١١٦٢</div>
      </div>

      <div class="card card-pad" style="background:color-mix(in srgb,#C53030 8%,transparent);border-color:transparent;margin-bottom:16px">
        <div class="text-sm text-center" style="color:#C53030;line-height:1.7">
          ${Icons.alert} هذه صفحة تعليمية فقط. لا يوجد هنا «استخارة إلكترونية»، ولا اختيار نتيجة، ولا قرار نيابة عنك. الاستخارة عبادة تقوم بها بنفسك.
        </div>
      </div>

      <div class="divider-label">متى تصلى الاستخارة؟</div>
      <div class="card card-pad">
        <p class="text-sm" style="line-height:1.8">
          عند الإقدام على أمر من الأمور المباحة وترددت فيه: زواج، عمل، سفر، تجارة، دراسة...
          فإذا هممت بأمر ولم تتضح لك طريقته، فصلِّ الاستخارة.
        </p>
        <p class="text-sm text-muted mt-2" style="line-height:1.7">
          لا تُصلى في matters التي فيها نص شرعي (كالحرام) ولا في الفرائض. تُصلى في المباحات والتخيير بين خيرين.
        </p>
      </div>

      <div class="divider-label">كيف تصليها؟</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--reflect-color)">١</div>
          <div class="row-body">
            <div class="row-title">تتوضأ كالعادة</div>
          </div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--reflect-color)">٢</div>
          <div class="row-body">
            <div class="row-title">تنوي ركعتين نافلة</div>
            <div class="row-sub">من غير الفريضة. وتصلى في أي وقت ليس فيه نهي عن الصلاة.</div>
          </div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--reflect-color)">٣</div>
          <div class="row-body">
            <div class="row-title">تقرأ في الأولى الفاتحة + سورة قصيرة</div>
            <div class="row-sub">يُستحب قراءة سورة الكافرون في الأولى</div>
          </div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--reflect-color)">٤</div>
          <div class="row-body">
            <div class="row-title">تقرأ في الثانية الفاتحة + سورة قصيرة</div>
            <div class="row-sub">يُستحب قراءة سورة الإخلاص في الثانية</div>
          </div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="font-weight:700;color:var(--reflect-color)">٥</div>
          <div class="row-body">
            <div class="row-title">بعد التسليم تدعو بدعاء الاستخارة</div>
            <div class="row-sub">رافعًا يديك، مقبلاً على الله بقلبك.</div>
          </div>
        </div>
      </div>

      <div class="divider-label">دعاء الاستخارة</div>
      <div class="card card-pad-lg" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-purple) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-purple) 30%,transparent)">
        <div class="font-quran" style="font-size:18px;line-height:2.0;color:var(--fg-strong)">
          اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ
        </div>
        <div class="font-quran mt-4" style="font-size:18px;line-height:2.0;color:var(--fg-strong)">
          اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ — <span style="color:var(--remind-color)">وتسميه باسمه</span> — خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ
        </div>
        <div class="font-quran mt-4" style="font-size:18px;line-height:2.0;color:var(--fg-strong)">
          وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ — <span style="color:var(--remind-color)">وتسميه باسمه</span> — شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِي الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ
        </div>
        <div class="text-xs text-muted text-center mt-4">رواه البخاري ١١٦٢</div>
      </div>

      <div class="divider-label">ماذا بعد الاستخارة؟</div>
      <div class="card card-pad">
        <p class="text-sm" style="line-height:1.8">
          بعد الاستخارة، انطلق في أمرك. <span class="font-semi">ليس شرطًا أن ترى رؤيا</span> كما يظن البعض.
          الاستخارة تفويض لله، فإن يسر الله الأمر فهو خير، وإن صرفه فاصبر.
        </p>
        <p class="text-sm text-muted mt-3" style="line-height:1.7">
          قال عبد الله بن عمر رضي الله عنهما: «إذا استخار الله فليُقدم على ما يختار، ولا يلتفت إلى شيء».
          فالأصل هو الإقدام بعد الاستخارة، ما لم يظهر لك صرف.
        </p>
      </div>

      <div class="card card-pad mt-4" style="background:var(--bg-subtle);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} يُكررها إن لم يتضح الأمر: سبع مرات كما روي عن بعض السلف.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
