/* =====================================================================
   friday.js — يوم الجمعة (spec section 46)
   - Surah Al-Kahf recommendation
   - Salawat on the Prophet ﷺ
   - Adhkar
   - Dua
   - Friday wird
   ===================================================================== */

import { Icons } from '../../components/icons.js';
import { navigate } from '../router.js';

export function renderFriday(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>يوم الجمعة</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-blue) 18%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
          ${Icons.book}
        </div>
        <h3 class="h3">خير يوم طلعت عليه الشمس</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
          عن أبي هريرة رضي الله عنه أن النبي ﷺ قال:<br>
          «خَيْرُ يَوْمٍ طَلَعَتْ فِيهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ»
          <br><span class="text-xs text-subtle">(رواه مسلم ٢٧٨٩)</span>
        </p>
      </div>

      <div class="divider-label">سورة الكهف</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          «مَنْ قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»
        </div>
        <div class="text-xs text-muted mb-3">(رواه الحاكم وصححه الألباني)</div>
        <a href="#/quran/18" class="btn btn-primary btn-block">
          ${Icons.book} اقرأ سورة الكهف
        </a>
      </div>

      <div class="divider-label">الصلاة على النبي ﷺ</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:12px">
          اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ
        </div>
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:12px">
          اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ
        </div>
        <div class="text-xs text-muted">
          عن أوس بن أوس رضي الله عنه قال: قال رسول الله ﷺ: «إِنَّ مِنْ أَفْضَلِ أَيَّامِكُمْ يَوْمَ الْجُمُعَةِ... فَأَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ فِيهِ» (رواه أبو داود ١٠٤٧، صححه الألباني)
        </div>
      </div>

      <div class="divider-label">ساعة الإجابة</div>
      <div class="card card-pad">
        <div class="text-sm" style="line-height:1.8">
          عن أبي هريرة رضي الله عنه أن النبي ﷺ ذكر يوم الجمعة فقال:
          <div class="font-quran mt-2" style="line-height:1.9">«فِيهِ سَاعَةٌ لَا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ وَهُوَ قَائِمٌ يُصَلِّي يَسْأَلُ اللَّهَ شَيْئًا إِلَّا أَعْطَاهُ إِيَّاهُ»</div>
          <div class="text-xs text-muted mt-2">(متفق عليه — البخاري ٩٣٥، مسلم ٨٥٢)</div>
          <div class="mt-3 text-muted">وأرجح الأقوال أنها آخر ساعة قبل المغرب (بعد العصر)، فاحرص على الدعاء فيها.</div>
        </div>
      </div>

      <div class="divider-label">أدعية مأثورة ليوم الجمعة</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ، وَأَعُوذُ بِكَ مِنَ النَّارِ
        </div>
        <div class="text-xs text-muted mb-3">(رواه ابن ماجه ٤٢٥٢)</div>

        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ، رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا
        </div>
        <div class="text-xs text-muted">(من أدعية القرآن)</div>
      </div>

      <div class="divider-label">سنن الجمعة</div>
      <div class="list">
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">الغسل والتطيب</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">لبس أحسن الثياب</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">التبكير للصلاة</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">قراءة سورة الكهف</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">الإكثار من الصلاة على النبي ﷺ</div></div>
        </div>
        <div class="row" style="cursor:default">
          <div class="row-icon" style="color:var(--quran-color)">${Icons.check}</div>
          <div class="row-body"><div class="row-title">الدعاء في ساعة الإجابة</div></div>
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
