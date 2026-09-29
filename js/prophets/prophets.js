/* =====================================================================
   prophets.js — قصص الأنبياء (spec section 41)
   Stories of prophets linked to Quranic verses.
   ===================================================================== */

import { Icons } from '../../components/icons.js';

const PROPHETS = [
  {
    id: 'adam',
    name: 'آدم عليه السلام',
    title: 'أبو البشر',
    quranRef: { surah: 2, ayah: 30 },
    summary: 'خلقه الله بيده ونفخ فيه من روحه، وأسجد له ملائكته. علّمه الأسماء كلها. ثم أمره الله بالهبوط من الجنة بعد الخطيئة، فتاب الله عليه.',
    lessons: [
      'فضل آدم على الملائكة بالعلم',
      'التوبة من الذنب طريق المغفرة',
      'عداوة الشيطان للإنسان قديمة',
    ],
  },
  {
    id: 'nuh',
    name: 'نوح عليه السلام',
    title: 'شيخ المرسلين',
    quranRef: { surah: 71, ayah: 1 },
    summary: 'دعا قومه ٩٥٠ سنة فلم يؤمن منهم إلا قليل. أمره الله أن يصنع السفينة، فركب فيها مع من آمن، وغرقت الأرض بالطوفان.',
    lessons: [
      'الصبر في الدعوة ولو طال الزمن',
      'هلاك المكذبين سنة إلهية',
      'نجاة المؤمنين برحمة الله',
    ],
  },
  {
    id: 'ibrahim',
    name: 'إبراهيم عليه السلام',
    title: 'خليل الرحمن',
    quranRef: { surah: 37, ayah: 83 },
    summary: 'حطم أصنام قومه، وأُلقي في النار فجعلها الله عليه بردًا وسلامًا. هاجر إلى الشام، وابتُلي بذبح ابنه إسماعيل، وبناء الكعبة معه. جعله الله إمامًا للناس.',
    lessons: [
      'التوحيد الخالص',
      'الابتلاء سبب للرفعة',
      'بر الوالدين وإن كان مشركًا',
    ],
  },
  {
    id: 'ismael',
    name: 'إسماعيل عليه السلام',
    title: 'الذبيح',
    quranRef: { surah: 37, ayah: 102 },
    summary: 'ابن إبراهيم من هاجر. صبر على الذبح طاعة لله، ففداه الله بكبش عظيم. ساعد أباه في بناء الكعبة. كان أول من ركب الخيل.',
    lessons: [
      'طاعة الوالدين',
      'الصبر عند الابتلاء',
      'تعاون الآباء والأبناء على الطاعة',
    ],
  },
  {
    id: 'ishaq',
    name: 'إسحاق عليه السلام',
    title: 'الابن المبشر',
    quranRef: { surah: 11, ayah: 71 },
    summary: 'بُشر به إبراهيم وسارة وهو كبير السن. كان ابنًا صالحًا ونبيًا من الأنبياء. منه نسل بني إسرائيل.',
    lessons: [
      'رحمات الله تأتي بعد الابتلاء',
      'بشارات الله للصالحين',
    ],
  },
  {
    id: 'yaqub',
    name: 'يعقوب عليه السلام',
    title: 'إسرائيل',
    quranRef: { surah: 2, ayah: 132 },
    summary: 'ابن إسحاق، وأبو الأسباط. ابتُلي بفقد ابنه يوسف، فبكاه حتى ابيضت عيناه. ثم اجتمع به في مصر بعد سنين.',
    lessons: [
      'الصبر الجميل على المصيبة',
      'حسن الظن بالله',
      'الرجاء في الفرج',
    ],
  },
  {
    id: 'yusuf',
    name: 'يوسف عليه السلام',
    title: 'أحسن القصص',
    quranRef: { surah: 12, ayah: 3 },
    summary: 'رآى رؤيا وهو صغير، فحسده إخوته وألقوه في الجب. بِيع في مصر، وابتُلي بالنساء، ثم بالسجن. ثم ولاّه الله خزائن الأرض، واجتمع بأهله.',
    lessons: [
      'العفاف في الفتنة',
      'الصبر في السجن',
      'حسن الختام للصابرين',
    ],
  },
  {
    id: 'shuaib',
    name: 'شعيب عليه السلام',
    title: 'خطيب الأنبياء',
    quranRef: { surah: 7, ayah: 85 },
    summary: 'أُرسل إلى أهل مدين، دعاهم إلى التوحيد وأمانة الميزان والميزان. أخذهم الله بالرجفة فأهلكهم.',
    lessons: [
      'النصح في المعاملات',
      'أمانة الكيل والميزان',
      'عاقبة التكذيب',
    ],
  },
  {
    id: 'musa',
    name: 'موسى عليه السلام',
    title: 'كليم الله',
    quranRef: { surah: 20, ayah: 9 },
    summary: 'أُرسل إلى فرعون. رباه الله في قصر فرعون، ثم هرب إلى مدين، ورجع بالرسالة. شق له البحر فنجا بنو إسرائيل وغرق فرعون.',
    lessons: [
      'قوة الله فوق كل قوة',
      'نجاة المؤمنين وإهلاك الطغاة',
      'الصبر على أذى القوم',
    ],
  },
  {
    id: 'harun',
    name: 'هارون عليه السلام',
    title: 'وزير موسى',
    quranRef: { surah: 20, ayah: 30 },
    summary: 'أخو موسى، طلبه موسى من الله ليكون وزيرًا له في رسالته. كان فصيحًا، بقي مع قومه حين ذهب موسى لميقات ربه.',
    lessons: [
      'أهمية التعاون في الدعوة',
      'الصبر على الانحراف',
    ],
  },
  {
    id: 'dawud',
    name: 'داود عليه السلام',
    title: 'صاحب الزبور',
    quranRef: { surah: 38, ayah: 17 },
    summary: 'قتل جالوت ونصر الله على بني إسرائيل. ملك ونبوة، أوتي الزبور وصوتًا جميلاً، وأُنزل له الحديد لينسج الدرع.',
    lessons: [
      'الشكر على النعم',
      'فضل الصوت الحسن بالذكر',
      'العدل في الحكم',
    ],
  },
  {
    id: 'sulaiman',
    name: 'سليمان عليه السلام',
    title: 'نبي المُلك',
    quranRef: { surah: 27, ayah: 15 },
    summary: 'ورث ملك أبيه داود، وآتاه الله ملكًا عظيمًا: الإنس والجن والطير والريح. قصة بلقيس ملكة سبأ ودخولها الإسلام معه.',
    lessons: [
      'شكر النعمة',
      'العلم والحكمة فوق المُلك',
      'دعوة الأمم بالحسنى',
    ],
  },
  {
    id: 'ayyub',
    name: 'أيوب عليه السلام',
    title: 'الصابر',
    quranRef: { surah: 21, ayah: 83 },
    summary: 'ابتُلي في ماله وأهله وجسده ١٨ سنة، فصبر صبرًا جميلاً، فكشف الله عنه الضر ورد له أهله ومثله معهم.',
    lessons: [
      'الصبر على البلاء',
      'حسن الظن بالله',
      'الفرج بعد الشدة',
    ],
  },
  {
    id: 'yunus',
    name: 'يونس عليه السلام',
    title: 'صاحب الحوت',
    quranRef: { surah: 21, ayah: 87 },
    summary: 'ذهب عن قومه غاضبًا، فابتلعه الحوت في البحر. نادى في الظلمات: «لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ». فنجاه الله.',
    lessons: [
      'دعوة المكروب',
      'التوبة من الزلل',
      'رجاء الفرج في أشد الظلمات',
    ],
  },
  {
    id: 'isa',
    name: 'عيسى عليه السلام',
    title: 'روح الله وكلمته',
    quranRef: { surah: 3, ayah: 45 },
    summary: 'وُلد من غير أب، آية للعالمين. تكلم في المهد، وأحيى الموتى بإذن الله، وخلق من الطين طيرًا. رُفع إلى السماء وينزل في آخر الزمان.',
    lessons: [
      'قدرة الله على خلق ما يشاء',
      'معجزات الأنبياء بإذن الله',
      'الإيمان به نبيًا لا إلهًا',
    ],
  },
  {
    id: 'muhammad',
    name: 'محمد ﷺ',
    title: 'خاتم النبيين',
    quranRef: { surah: 33, ayah: 40 },
    summary: 'خاتم الأنبياء والمرسلين. بُعث للناس كافة. بلّغ الرسالة وأدى الأمانة ونصح الأمة. توفي بالمدينة بعد حجة الوداع. شريعته باقية إلى يوم القيامة.',
    lessons: [
      'اتباع سنته ﷺ',
      'محبته فوق النفس والمال',
      'الصلاة عليه كثيرًا',
    ],
  },
];

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

export function renderProphets(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>قصص الأنبياء</h2>
        <span class="text-sm text-muted">${toAr(PROPHETS.length)} نبيًا</span>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-purple) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-purple) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-purple) 18%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center">
          ${Icons.prophets}
        </div>
        <h3 class="h3">أنبياء الله</h3>
        <p class="text-muted mt-2 font-quran" style="font-size:16px;line-height:1.9">
          ﴿ وَكُلًّا نَقُصُّ عَلَيْكَ مِنْ أَنْبَاءِ الرُّسُلِ مَا نُثَبِّتُ بِهِ فُؤَادَكَ ﴾
        </p>
        <div class="text-xs text-muted mt-1">سورة هود • آية ١٢٠</div>
      </div>

      <div class="list">
        ${PROPHETS.map(p => `
          <a class="row" href="#/more/prophets/${p.id}">
            <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-purple) 14%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center;font-weight:700">
              ${Icons.prophets}
            </div>
            <div class="row-body">
              <div class="row-title font-quran" style="font-size:18px">${escapeHtml(p.name)}</div>
              <div class="row-sub">${escapeHtml(p.title)}</div>
            </div>
            <div class="row-trail">${Icons.chevronLeft}</div>
          </a>
        `).join('')}
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}

export function renderProphetDetail(container, { prophetId }) {
  const p = PROPHETS.find(x => x.id === prophetId);
  if (!p) { location.hash = '/more/prophets'; return; }

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>${escapeHtml(p.name)}</h2>
        <span class="text-sm text-muted">${escapeHtml(p.title)}</span>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-purple) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-purple) 30%,transparent);margin-bottom:16px">
        <div style="width:72px;height:72px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-purple) 20%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center">
          ${Icons.prophets}
        </div>
        <h3 class="h2 font-quran">${escapeHtml(p.name)}</h3>
        <div class="text-sm text-muted mt-1">${escapeHtml(p.title)}</div>
      </div>

      <div class="divider-label">القصة</div>
      <div class="card card-pad">
        <p class="text-md" style="line-height:1.9">${escapeHtml(p.summary)}</p>
      </div>

      <div class="divider-label">المرجع القرآني</div>
      <a class="card card-pad" href="#/quran/${p.quranRef.surah}" style="display:block;text-decoration:none;color:inherit">
        <div class="font-quran text-md" style="line-height:1.9;color:var(--quran-color)">
          راجع سورة رقم ${toAr(p.quranRef.surah)} • آية ${toAr(p.quranRef.ayah)}
        </div>
        <div class="text-xs text-muted mt-2">${Icons.chevronLeft} اضغط لفتح السورة</div>
      </a>

      <div class="divider-label">العبر والدروس</div>
      <div class="list">
        ${p.lessons.map(l => `
          <div class="row" style="cursor:default">
            <div class="row-icon" style="color:var(--reflect-color)">${Icons.check}</div>
            <div class="row-body"><div class="row-title">${escapeHtml(l)}</div></div>
          </div>
        `).join('')}
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
