/* =====================================================================
   seerah.js — السيرة النبوية (spec section 40)
   Timeline: المولد → الوحي → الدعوة → الهجرة → المدينة → الغزوات → فتح مكة → حجة الوداع → الوفاة
   ===================================================================== */

import { Icons } from '../../components/icons.js';

const TIMELINE = [
  { year: 'عام الفيل', title: 'المولد الشريف', desc: 'وُلد النبي ﷺ في مكة في عام الفيل (٥٧٠م تقريبًا)، في يوم الاثنين ١٢ ربيع الأول.父亲 عبد الله بن عبد المطلب، وأمه آمنة بنت وهب.', icon: 'sparkles' },
  { year: 'قبل البعثة', title: 'النشأة والرعي', desc: 'نشأ يتيمًا، وكفله جده عبد المطلب ثم عمه أبو طالب. عمل برعٍ للغنم في صباه، ثم بالتجارة. عُرف بين قومه بالصادق الأمين.', icon: 'user' },
  { year: '٢٥ عامًا', title: 'الزواج من خديجة', desc: 'تزوج خديجة بنت خويلد رضي الله عنها، وكانت أول من آمن به. أنجب منها كل أولاده ما عدا إبراهيم.', icon: 'heart' },
  { year: '٤٠ سنة', title: 'بدء الوحي', desc: 'في غار حراء، نزل عليه جبريل عليه السلام بأول الوحي: ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾. رجع إلى خديجة يرجف فؤاده فثبّتته.', icon: 'book' },
  { year: 'السنة ١-٣', title: 'الدعوة السرية', desc: 'دعا سرًا ثلاث سنوات. آمن: خديجة، علي، زيد بن حارثة، أبو بكر الصديق، ثم عثمان، الزبير، عبد الرحمن بن عوف، سعد بن أبي وقاص، طلحة.', icon: 'user' },
  { year: 'السنة ٤', title: 'الدعوة الجهرية', desc: 'نزل: ﴿فَاصْدَعْ بِمَا تُؤْمَرُ﴾. صعد على الصفا ودعا قريشًا، وبدأ الابتلاء والأذى للمسلمين.', icon: 'alert' },
  { year: 'السنة ٥', title: 'الهجرة الأولى إلى الحبشة', desc: 'أمر النبي ﷺ بعض أصحابه بالهجرة إلى الحبشة لِما فيها من ملك عادل (النجاشي). ثم تبعتهم هجرة ثانية.', icon: 'arrowLeft' },
  { year: 'السنة ٦-٧', title: 'الحصار في شعب أبي طالب', desc: 'حاصرته قريش هو وبنو هاشم في الشعب ثلاث سنين، قَلَّ الطعام فيها حتى أصابهم الجوع.', icon: 'alert' },
  { year: 'السنة ١٠', title: 'عام الحزن', desc: 'توفي عمه أبو طالب وزوجته خديجة في نفس العام، فاشتد الأذى، وسمي عام الحزن.', icon: 'alert' },
  { year: 'السنة ١٠', title: 'الإسراء والمعراج', desc: 'أُسري به من المسجد الحرام إلى المسجد الأقصى، ثم عُرج به إلى السماوات العُلا. وفُرضت الصلوات الخمس.', icon: 'sparkles' },
  { year: 'السنة ١١', title: 'بيعتا العقبة الأولى والثانية', desc: 'أسلم الأنصار من يثرب، وبايعوا النبي ﷺ بيعة النساء ثم بيعة الحرب، فأذن للمسلمين بالهجرة.', icon: 'check' },
  { year: 'السنة ١٣', title: 'الهجرة إلى المدينة', desc: 'هاجر النبي ﷺ وأبو بكر رضي الله عنه، ووصلا إلى قباء فبنى مسجد قباء، ثم دخل المدينة وبنى مسجده النبوي.', icon: 'arrowLeft' },
  { year: 'السنة ٢ هـ', title: 'غزوة بدر الكبرى', desc: 'أول معركة فاصلة، نصر الله المسلمين على قريش نصرًا عزيزًا. قال تعالى: ﴿يَوْمَ الْفُرْقَانِ يَوْمِ الْتَقَى الْجَمْعَانِ﴾.', icon: 'book' },
  { year: 'السنة ٣ هـ', title: 'غزوة أُحد', desc: 'كان النصر للمسلمين أول النهار، ثم خالف الرماة أمر النبي ﷺ فاستُشهد ٧٠ من الصحابة منهم حمزة عم النبي ﷺ.', icon: 'alert' },
  { year: 'السنة ٥ هـ', title: 'غزوة الخندق (الأحزاب)', desc: 'حفر المسلمون خندقًا حول المدينة لإحباط زحف ١٠ آلاف من الأحزاب. صرف الله الكفار بريح شديدة.', icon: 'check' },
  { year: 'السنة ٦ هـ', title: 'صلح الحديبية', desc: 'قصد النبي ﷺ العمرة فمنعته قريش، وعُقد صلح مدته ١٠ سنوات، سماه الله «فتحًا مبينًا».', icon: 'check' },
  { year: 'السنة ٧ هـ', title: 'غزوة خيبر ورسائل الملوك', desc: 'فتح الله خيبر، وأرسل النبي ﷺ رسائل إلى ملوك الأرض (هرقل، كسرى، النجاشي، المقوقس...).', icon: 'book' },
  { year: 'السنة ٨ هـ', title: 'فتح مكة', desc: 'نقضت قريش الصلح، فزحف النبي ﷺ بـ١٠ آلاف ففتح مكة دون قتال يُذكر، وحطم ٣٦٠ صنمًا حول الكعبة.', icon: 'check' },
  { year: 'السنة ٨ هـ', title: 'غزوة حنين', desc: 'بعد الفتح مباشرة، حاربت قبيلة هوازن وثقيف، افتتن المسلمون أول النهار ثم نصرهم الله.', icon: 'book' },
  { year: 'السنة ٩ هـ', title: 'غزوة تبوك', desc: 'آخر غزواته ﷺ، سار في حر شديد إلى أطراف الشام،却没有 قتال، وعاد بمعاهدات.', icon: 'book' },
  { year: 'السنة ١٠ هـ', title: 'حجة الوداع', desc: 'حج النبي ﷺ حجة واحدة، وخطب خطبة جامعة، وأنزل الله: ﴿الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ﴾.', icon: 'hajj' },
  { year: 'السنة ١١ هـ', title: 'الوفاة', desc: 'توفي ﷺ يوم الاثنين ١٢ ربيع الأول سنة ١١ هـ، عن ٦٣ سنة. دُفن في حجرة عائشة رضي الله عنها بالمدينة.', icon: 'moon' },
];

export function renderSeerah(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>السيرة النبوية</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-purple) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-purple) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-purple) 18%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center">
          ${Icons.seerah}
        </div>
        <h3 class="h3">سيرة النبي ﷺ</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
          من المولد إلى الوفاة — خط زمني موجز
        </p>
      </div>

      <div class="seerah-timeline">
        ${TIMELINE.map(t => `
          <div class="seerah-event">
            <div class="seerah-marker">${Icons[t.icon] || Icons.sparkles}</div>
            <div class="seerah-content card card-pad">
              <div class="seerah-year">${t.year}</div>
              <div class="seerah-title">${t.title}</div>
              <div class="seerah-desc">${t.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card card-pad mt-4" style="background:color-mix(in srgb,var(--c-purple) 8%,transparent);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} هذا ملخص موجز للسيرة. للاستزادة راجع: «الرحيق المختوم» للمباركفوري، «زاد المعاد» لابن القيم، «البداية والنهاية» لابن كثير.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}
