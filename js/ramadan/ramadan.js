/* =====================================================================
   ramadan.js — رمضان (spec section 47)
   - Prayer times with imsak/iftar emphasis
   - Daily wird
   - Ramadan khatma
   - Qiyam / Witr
   - Adhkar
   - Duas (iftar, suhoor)
   - Sadaqah
   ===================================================================== */

import { Icons } from '../../components/icons.js';
import { Storage } from '../storage.js';

export function renderRamadan(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>رمضان</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-purple) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-purple) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-purple) 18%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center">
          ${Icons.ramadan}
        </div>
        <h3 class="h3">شهر القرآن</h3>
        <p class="text-muted mt-2 font-quran" style="font-size:16px;line-height:1.9">
          ﴿ شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ ﴾
        </p>
        <div class="text-xs text-muted mt-1">سورة البقرة • آية ١٨٥</div>
      </div>

      <div class="divider-label">دعاء الإفطار</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ
        </div>
        <div class="text-xs text-muted mb-3">(رواه أبو داود ٢٣٥٧ — حسن)</div>
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
        </div>
        <div class="text-xs text-muted">(رواه أبو داود ٢٣٥٨)</div>
      </div>

      <div class="divider-label">دعاء السحور</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ
        </div>
        <div class="text-xs text-muted">(من الأذكار المأثورة)</div>
      </div>

      <div class="divider-label">ختمة رمضان</div>
      <div class="card card-pad">
        <p class="text-sm" style="line-height:1.7">
          احرص على ختم القرآن في رمضان مرة على الأقل. وقد كان النبي ﷺ يَدْرُس القرآن في رمضان.
        </p>
        <div class="mt-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          <div class="card card-pad-sm text-center" style="background:var(--bg-subtle)">
            <div class="text-xs text-muted">ورد يومي</div>
            <div class="font-bold" style="color:var(--quran-color)">١ جزء</div>
            <div class="text-xs text-muted">لختمة في ٣٠ يومًا</div>
          </div>
          <div class="card card-pad-sm text-center" style="background:var(--bg-subtle)">
            <div class="text-xs text-muted">ورد يومي</div>
            <div class="font-bold" style="color:var(--action-color)">٢ جزء</div>
            <div class="text-xs text-muted">لختمة في ١٥ يومًا</div>
          </div>
          <div class="card card-pad-sm text-center" style="background:var(--bg-subtle)">
            <div class="text-xs text-muted">ورد يومي</div>
            <div class="font-bold" style="color:var(--reflect-color)">٣ أجزاء</div>
            <div class="text-xs text-muted">لختمة في ١٠ أيام</div>
          </div>
        </div>
        <a href="#/quran" class="btn btn-primary btn-block mt-3">${Icons.book} ابدأ القراءة</a>
      </div>

      <div class="divider-label">قيام الليل والوتر</div>
      <div class="card card-pad">
        <p class="text-sm" style="line-height:1.7">
          عن أبي هريرة رضي الله عنه قال: كان رسول الله ﷺ يُرَغِّب في قيام رمضان من غير أن يأمرهم بعزيمة.
        </p>
        <div class="font-quran mt-3" style="line-height:1.9;color:var(--fg-strong)">
          «مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ»
        </div>
        <div class="text-xs text-muted mt-2">(متفق عليه — البخاري ٣٧، مسلم ٧٥٩)</div>
      </div>

      <div class="divider-label">أعمال رمضان</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">الصيام</div><div class="row-sub">من الفجر إلى المغرب</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">قراءة القرآن</div><div class="row-sub">ختمة كاملة على الأقل</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">قيام الليل (التراويح)</div><div class="row-sub">في المسجد أو البيت</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">الصدقة</div><div class="row-sub">«كان رسول الله ﷺ أجود بالخير من الريح المرسلة»</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">الإكثار من الذكر والاستغفار</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">إطعام الطعام</div><div class="row-sub">إفطار الصائمين</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">العتق من النار</div><div class="row-sub">الدعاء في كل وقت</div></div>
        </div>
      </div>

      <div class="divider-label">ليلة القدر</div>
      <div class="card card-pad">
        <div class="font-quran text-lg" style="line-height:1.9;color:var(--fg-strong);text-align:center;margin-bottom:8px">
          ﴿ لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ ﴾
        </div>
        <div class="text-xs text-muted text-center mb-3">سورة القدر • آية ٣</div>
        <p class="text-sm" style="line-height:1.7">
          التمسها في العشر الأواخر، خصوصًا في الليالي الوترية (٢١، ٢٣، ٢٥، ٢٧، ٢٩).
        </p>
        <div class="font-quran mt-3" style="line-height:1.9;color:var(--fg-strong)">
          «اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي»
        </div>
        <div class="text-xs text-muted mt-2">(رواه الترمذي ٣٥١٣ — حسن)</div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
