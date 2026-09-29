/* =====================================================================
   fasting.js — صيام التطوع (spec section 49)
   - Monday & Thursday
   - White days (13/14/15 of each hijri month)
   - Arafah (9 Dhu al-Hijjah)
   - Ashura (10 Muharram) + Tasu'a (9)
   - 6 days of Shawwal
   - Day of Arafah fasting virtue
   ===================================================================== */

import { Icons } from '../../components/icons.js';

export function renderFasting(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>صيام التطوع</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-cyan) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-cyan) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-cyan) 18%,transparent);color:var(--action-color);display:flex;align-items:center;justify-content:center">
          ${Icons.fasting}
        </div>
        <h3 class="h3">صيام النافلة</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
          عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ:
        </p>
        <div class="font-quran mt-2" style="line-height:1.9">«كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلَّا الصِّيَامَ، فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ»</div>
        <div class="text-xs text-muted mt-2">(متفق عليه — البخاري ١٩٠٤، مسلم ١١٥١)</div>
      </div>

      <div class="divider-label">الاثنين والخميس</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          «تُعْرَضُ الْأَعْمَالُ يَوْمَ الِاثْنَيْنِ وَالْخَمِيسِ، فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»
        </div>
        <div class="text-xs text-muted">(رواه الترمذي ٧٤٧ — حسن)</div>
      </div>

      <div class="divider-label">الأيام البيض (١٣ و١٤ و١٥)</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          «يَا أَبَا ذَرٍّ، إِذَا صُمْتَ مِنَ الشَّهْرِ ثَلَاثَةَ أَيَّامٍ فَصُمْ ثَلَاثَ عَشْرَةَ وَأَرْبَعَ عَشْرَةَ وَخَمْسَ عَشْرَةَ»
        </div>
        <div class="text-xs text-muted">(رواه الترمذي ٧٦١ — حسن)</div>
        <div class="text-sm text-muted mt-3" style="line-height:1.7">
          وسُميت بيضًا لأن لياليها مقمرة. وهي مستحبة في كل شهر هجري.
        </div>
      </div>

      <div class="divider-label">يوم عرفة (٩ ذو الحجة)</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          «صِيَامُ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ»
        </div>
        <div class="text-xs text-muted mb-3">(رواه مسلم ١١٦٢)</div>
        <div class="text-sm text-muted" style="line-height:1.7">
          لغير الحاج فقط. أما الحاج فلا يصوم يوم عرفة ليكون قويًا على الدعاء.
        </div>
      </div>

      <div class="divider-label">عاشوراء (١٠ محرم)</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          «صِيَامُ يَوْمِ عَاشُورَاءَ، إِنِّي أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ»
        </div>
        <div class="text-xs text-muted mb-3">(رواه مسلم ١١٦٢)</div>
        <div class="text-sm text-muted" style="line-height:1.7">
          ويُستحب صيام يومٍ قبله (تاسوعاء — ٩ محرم) مخالفةً لليهود، كما قال النبي ﷺ:
        </div>
        <div class="font-quran text-md mt-2" style="line-height:1.9;color:var(--fg-strong)">
          «لَئِنْ بَقِيتُ إِلَى قَابِلٍ لَأَصُومَنَّ التَّاسِعَ»
        </div>
        <div class="text-xs text-muted mt-2">(رواه مسلم ١١٣٤)</div>
      </div>

      <div class="divider-label">ستة من شوال</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          «مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ»
        </div>
        <div class="text-xs text-muted">(رواه مسلم ١١٦٤)</div>
      </div>

      <div class="divider-label">صيام داود عليه السلام</div>
      <div class="card card-pad">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">
          «أَحَبُّ الصِّيَامِ إِلَى اللَّهِ صِيَامُ دَاوُدَ، وَأَحَبُّ الصَّلَاةِ إِلَى اللَّهِ صَلَاةُ دَاوُدَ، كَانَ يَنَامُ نِصْفَ اللَّيْلِ وَيَقُومُ ثُلُثَهُ وَيَنَامُ سُدُسَهُ، وَكَانَ يَصُومُ يَوْمًا وَيُفْطِرُ يَوْمًا»
        </div>
        <div class="text-xs text-muted">(متفق عليه — البخاري ١١٣١، مسلم ١١٥٩)</div>
      </div>

      <div class="card card-pad mt-4" style="background:color-mix(in srgb,var(--c-cyan) 8%,transparent);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} الصيام النافل لا يُقضى إذا أُفطر لعذر. وأفضل الصيام بعد رمضان: ست شوال، ثم عرفة، ثم عاشوراء.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
