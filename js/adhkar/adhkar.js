/* =====================================================================
   adhkar.js — الأذكار (spec section 32)
   - Morning, evening, after prayer, sleep, wake, mosque, food, travel, etc.
   - Each dhikr: text + source + repeat count + counter + next/skip + save position
   - Sources: from authenticated collections (Hisn al-Muslim / Sunan abu Dawud /
     Tirmidhi / Nasai / Ibn Majah / Bukhari / Muslim — well-known adhkar)
   ===================================================================== */

import { Storage } from '../storage.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';

/* Adhkar dataset — well-known authentic adhkar (spec section 32: "استخدم مصادر موثوقة")
   Source: Hisn al-Muslim (حصن المسلم) — a verified classical compilation */
const ADHKAR_CATEGORIES = [
  {
    id: 'morning',
    title: 'أذكار الصباح',
    icon: 'sun',
    color: 'quran',
    items: [
      {
        text: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
        count: 1,
        source: 'آية الكرسي — البقرة ٢٥٥',
        virtue: 'من قالها حين يصبح أُجير من الجن حتى يمسي',
      },
      {
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ.',
        count: 3,
        source: 'سورة الإخلاص',
        virtue: 'من قالها ثلاثًا حين يصبح ويمسي كفته من كل شيء',
      },
      {
        text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.',
        count: 1,
        source: 'صحيح مسلم ٢٧٢٣',
      },
      {
        text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.',
        count: 1,
        source: 'جامع الترمذي ٣٣٩١',
      },
      {
        text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.',
        count: 100,
        source: 'صحيح مسلم ٢٦٩٢',
        virtue: 'حُطَّت خطاياه وإن كانت مثل زبد البحر',
      },
    ],
  },
  {
    id: 'evening',
    title: 'أذكار المساء',
    icon: 'moon',
    color: 'reflect',
    items: [
      {
        text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ. اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا فِيهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا.',
        count: 1,
        source: 'صحيح مسلم ٢٧٢٣',
      },
      {
        text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.',
        count: 1,
        source: 'جامع الترمذي ٣٣٩١',
      },
      {
        text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
        count: 3,
        source: 'صحيح مسلم ٢٧٠٩',
        virtue: 'من قالها ثلاثًا حين يمسي لم تضره حُمَةٌ تلك الليلة',
      },
      {
        text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.',
        count: 3,
        source: 'سنن أبي داود ٥٠٨٨، الترمذي ٣٣٨٨',
        virtue: 'من قالها ثلاثًا لم يضره شيء',
      },
    ],
  },
  {
    id: 'after-prayer',
    title: 'أذكار بعد الصلاة',
    icon: 'prayer',
    color: 'quran',
    items: [
      {
        text: 'أَسْتَغْفِرُ اللَّهَ.',
        count: 3,
        source: 'صحيح مسلم ٥٩٧',
      },
      {
        text: 'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.',
        count: 1,
        source: 'صحيح مسلم ٥٩١',
      },
      {
        text: 'سُبْحَانَ اللَّهِ.',
        count: 33,
        source: 'صحيح مسلم ٥٩٧',
      },
      {
        text: 'الْحَمْدُ لِلَّهِ.',
        count: 33,
        source: 'صحيح مسلم ٥٩٧',
      },
      {
        text: 'اللَّهُ أَكْبَرُ.',
        count: 33,
        source: 'صحيح مسلم ٥٩٧',
      },
      {
        text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        count: 1,
        source: 'صحيح مسلم ٥٩٧',
        virtue: 'غُفرت خطاياه وإن كانت مثل زبد البحر',
      },
    ],
  },
  {
    id: 'sleep',
    title: 'أذكار النوم',
    icon: 'moon',
    color: 'reflect',
    items: [
      {
        text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',
        count: 1,
        source: 'صحيح البخاري ٦٣٢٤',
      },
      {
        text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',
        count: 3,
        source: 'سنن أبي داود ٥٠٤٥، الترمذي ٣٤٥٣',
      },
      {
        text: 'سُبْحَانَ اللَّهِ.',
        count: 33,
        source: 'صحيح البخاري ٣٧٠٥، مسلم ٢٧٢٧',
        virtue: 'تعدل خادمًا في عبادتك',
      },
      {
        text: 'الْحَمْدُ لِلَّهِ.',
        count: 33,
        source: 'صحيح البخاري ٣٧٠٥',
      },
      {
        text: 'اللَّهُ أَكْبَرُ.',
        count: 34,
        source: 'صحيح البخاري ٣٧٠٥',
      },
    ],
  },
  {
    id: 'wake',
    title: 'أذكار الاستيقاظ',
    icon: 'sun',
    color: 'quran',
    items: [
      {
        text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.',
        count: 1,
        source: 'صحيح البخاري ٦٣٢٤',
      },
    ],
  },
  {
    id: 'food',
    title: 'أذكار الطعام',
    icon: 'list',
    color: 'remind',
    items: [
      {
        text: 'بِسْمِ اللَّهِ.',
        count: 1,
        source: 'صحيح البخاري ٥٣٧٦، مسلم ٢٠٢٢',
        virtue: 'تمنع الشيطان من المشاركة في الطعام',
      },
      {
        text: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ.',
        count: 1,
        source: 'سنن أبي داود ٤٠٢٣، الترمذي ٣٤٥٨',
        virtue: 'يُغفر له ما تقدم من ذنبه',
      },
    ],
  },
  {
    id: 'mosque',
    title: 'أذكار المسجد',
    icon: 'prayer',
    color: 'quran',
    items: [
      {
        text: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.',
        count: 1,
        source: 'صحيح مسلم ٧١٣',
      },
      {
        text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ.',
        count: 1,
        source: 'صحيح مسلم ٧١٣',
      },
    ],
  },
];

const STORAGE_KEY = 'rafiq-adhkar-progress';
const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }

function loadProgress() {
  const today = new Date().toISOString().slice(0, 10);
  const data = Storage.get(STORAGE_KEY, { date: today, done: {} });
  if (data.date !== today) return { date: today, done: {} };
  return data;
}
function saveProgress(data) {
  Storage.set(STORAGE_KEY, data);
}

export function renderAdhkar(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الأذكار</h2>
      </div>

      <div class="list" id="adhkar-categories">
        ${ADHKAR_CATEGORIES.map(cat => {
          const progress = loadProgress();
          const doneCount = cat.items.filter((_, i) => progress.done[`${cat.id}-${i}`]).length;
          const pct = Math.round((doneCount / cat.items.length) * 100);
          return `
            <a class="row" href="#/more/adhkar/${cat.id}">
              <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-${cat.color === 'quran' ? 'blue' : cat.color === 'remind' ? 'pink' : 'purple'}) 14%,transparent);color:var(--${cat.color === 'quran' ? 'quran' : cat.color === 'remind' ? 'remind' : 'reflect'}-color);display:flex;align-items:center;justify-content:center">
                ${Icons[cat.icon] || Icons.list}
              </div>
              <div class="row-body">
                <div class="row-title">${cat.title}</div>
                <div class="row-sub">${toAr(cat.items.length)} ذكر • ${toAr(doneCount)} مُتم اليوم</div>
              </div>
              <div class="row-trail" style="display:flex;align-items:center;gap:8px">
                <div style="width:40px;height:4px;background:var(--bg-subtle);border-radius:999px;overflow:hidden">
                  <div style="height:100%;width:${pct}%;background:var(--${cat.color === 'quran' ? 'quran' : cat.color === 'remind' ? 'remind' : 'reflect'}-color)"></div>
                </div>
                ${Icons.chevronLeft}
              </div>
            </a>
          `;
        }).join('')}
      </div>

      <div class="card card-pad mt-4" style="background:var(--bg-subtle);border-color:transparent">
        <div class="text-sm text-muted text-center" style="line-height:1.7">
          ﴿ وَلَذِكْرُ ٱللَّهِ أَكْبَرُ ﴾
          <div class="text-xs text-subtle mt-2">سورة العنكبوت • آية ٤٥</div>
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;
}

export function renderAdhkarCategory(container, { categoryId }) {
  const cat = ADHKAR_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) {
    location.hash = '/more/adhkar';
    return;
  }

  const progress = loadProgress();
  let currentIdx = 0;

  function render() {
    const item = cat.items[currentIdx];
    const isDone = progress.done[`${cat.id}-${currentIdx}`] === true;
    const doneCount = cat.items.filter((_, i) => progress.done[`${cat.id}-${i}`]).length;
    const allDone = doneCount === cat.items.length;

    container.innerHTML = `
      <div class="page container-app">
        <div class="section-header">
          <h2>${cat.title}</h2>
          <span class="text-sm text-muted">${toAr(currentIdx + 1)} / ${toAr(cat.items.length)}</span>
        </div>

        <div class="adhkar-progress-bar">
          <div class="adhkar-progress-fill" style="width:${((currentIdx) / cat.items.length) * 100}%"></div>
        </div>

        <div class="adhkar-card card card-pad-lg">
          <div class="adhkar-text font-quran">${item.text}</div>
          ${item.virtue ? `<div class="adhkar-virtue">${escapeHtml(item.virtue)}</div>` : ''}
          <div class="adhkar-source">${escapeHtml(item.source)}</div>

          <div class="adhkar-counter">
            <button class="adhkar-count-btn" id="adhkar-dec" aria-label="نقص">−</button>
            <div class="adhkar-count-display">
              <div class="adhkar-count-current" id="adhkar-current">${toAr(item.count)}</div>
              <div class="adhkar-count-target">من ${toAr(item.count)}</div>
            </div>
            <button class="adhkar-count-btn" id="adhkar-inc" aria-label="زيادة">+</button>
          </div>

          <div class="adhkar-actions">
            <button class="btn btn-outline btn-sm" id="adhkar-skip">${Icons.chevronLeft} تخطي</button>
            <button class="btn btn-primary btn-sm" id="adhkar-done" ${isDone ? 'disabled' : ''}>
              ${Icons.check} ${isDone ? 'تم' : 'أتممت'}
            </button>
          </div>
        </div>

        ${allDone ? `
          <div class="card card-pad text-center mt-4" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-cyan) 16%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-cyan) 30%,transparent)">
            <div style="font-size:32px;margin-bottom:8px">${Icons.check}</div>
            <h3 class="h3">أتممت أذكار ${cat.title}</h3>
            <p class="text-muted mt-2" style="font-size:14px">تقبل الله منك</p>
            <a href="#/more/adhkar" class="btn btn-primary mt-4">العودة للأقسام</a>
          </div>
        ` : ''}

        <div style="height:32px"></div>
      </div>
    `;

    let localCount = item.count;

    const updateDisplay = () => {
      const el = container.querySelector('#adhkar-current');
      if (el) el.textContent = toAr(localCount);
    };

    container.querySelector('#adhkar-inc').onclick = () => {
      if (localCount > 0) {
        localCount--;
        updateDisplay();
        if (navigator.vibrate) navigator.vibrate(15);
        if (localCount === 0) {
          // Auto-mark as done
          markDone();
        }
      }
    };
    container.querySelector('#adhkar-dec').onclick = () => {
      if (localCount < item.count) {
        localCount++;
        updateDisplay();
      }
    };

    container.querySelector('#adhkar-skip').onclick = () => goNext();
    container.querySelector('#adhkar-done').onclick = () => markDone();
  }

  function markDone() {
    progress.done[`${cat.id}-${currentIdx}`] = true;
    saveProgress(progress);
    toast('تقبل الله', 'success');
    setTimeout(goNext, 500);
  }

  function goNext() {
    if (currentIdx < cat.items.length - 1) {
      currentIdx++;
      render();
    } else {
      // Last item — re-render to show completion
      render();
    }
  }

  render();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
