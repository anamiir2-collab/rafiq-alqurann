/* =====================================================================
   sammuali.js — سمّعلي (spec section 27)
   Speech Recognition for memorization practice.
   - Hide verses
   - Listen to user's recitation (if browser supports SpeechRecognition)
   - Reveal words gradually
   - Detect errors (highlighted in red)
   - Graceful fallback if not supported
   - Clear disclaimer: not a substitute for human evaluation
   ===================================================================== */

import { Icons } from '../../components/icons.js';
import { loadQuran, getSurahs, getSurahMeta, getAyahText } from '../quran/quran-data.js';
import { toast } from '../../components/toast.js';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function normalize(s) {
  if (!s) return '';
  return String(s)
    .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '') // harakat
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')        // alef variants
    .replace(/\u0629/g, '\u0647')                            // taa marbuta
    .replace(/\u0649/g, '\u064A')                            // alef maqsura
    .replace(/[^\u0621-\u064A\s]/g, '')                      // non-arabic
    .replace(/\s+/g, ' ')
    .trim();
}

export async function renderSammuali(container) {
  await loadQuran();
  const surahs = getSurahs();

  const state = {
    surah: 1,
    ayah: 1,
    mode: 'idle', // idle | listening | done
    revealedWords: 0, // how many words of the ayah are revealed
    errors: [], // indices of words with detected errors
    recognizedText: '',
  };

  // Check SpeechRecognition support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SpeechRecognition && window.location.protocol === 'https:';

  let recognition = null;
  if (supported) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
  }

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>سمّعلي</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-cyan) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-cyan) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-cyan) 18%,transparent);color:var(--action-color);display:flex;align-items:center;justify-content:center">
          ${Icons.speaker}
        </div>
        <h3 class="h3">سمّعلي</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
          تدريب اختياري: اقرأ الآية، نستمع لتلاوتك، ونظهر الأخطاء باللون الأحمر
        </p>
      </div>

      ${!supported ? `
        <div class="card card-pad" style="background:color-mix(in srgb,var(--c-purple) 8%,transparent);border-color:transparent;margin-bottom:16px">
          <div class="text-sm" style="line-height:1.7;color:var(--reflect-color)">
            ${Icons.info} متصفحك لا يدعم التعرف على الصوت أو الصفحة ليست HTTPS. يمكنك استخدام هذه الصفحة في الوضع اليدوي:
          </div>
          <ul class="text-sm text-muted mt-3" style="line-height:1.9;padding-inline-start:20px">
            <li>اختر السورة والآية</li>
            <li>اخفِ الآية واقرأها من حفظك</li>
            <li>اضغط «كشف ذاتي» لعرض الآية ومقارنتها بنفسك</li>
            <li>إذا أخطأت، عُد وحاول مرة أخرى</li>
          </ul>
          <div class="text-xs text-muted mt-3">
            للتجربة الكاملة: استخدم Chrome على HTTPS (مثل GitHub Pages).
          </div>
        </div>
      ` : `
        <div class="card card-pad" style="background:color-mix(in srgb,var(--c-cyan) 8%,transparent);border-color:transparent;margin-bottom:16px">
          <div class="text-sm text-center" style="line-height:1.7;color:var(--action-color)">
            ✓ متصفحك يدعم التعرف على الصوت. اسمح بالمايك عند الطلب.
          </div>
        </div>
      `}

      <div class="card card-pad" style="background:color-mix(in srgb,#C53030 8%,transparent);border-color:transparent;margin-bottom:16px">
        <div class="text-xs text-center" style="color:#C53030;line-height:1.7">
          ${Icons.alert} تنبيه: هذا التدريب لا يُقيّم حفظك بدقة بشرية ولا يفحص التجويد. هو مجرد أداة مساعدة على المراجعة الذاتية. للحفظ الصحيح، راجع عند معلم أو قارئ متقن.
        </div>
      </div>

      <div class="divider-label">اختر السورة والآية</div>
      <div class="card card-pad">
        <div class="label">السورة</div>
        <select class="select mb-3" id="samm-surah">
          ${surahs.map(s => `<option value="${s.number}" ${s.number === state.surah ? 'selected' : ''}>${escapeHtml(s.name)} (${toAr(s.ayahCount)} آية)</option>`).join('')}
        </select>
        <div class="label">الآية</div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn-icon" id="samm-ayah-dec" aria-label="السابقة">−</button>
          <input type="number" class="input" id="samm-ayah" value="1" min="1" style="text-align:center" />
          <button class="btn-icon" id="samm-ayah-inc" aria-label="التالية">+</button>
        </div>
      </div>

      <div class="divider-label">الآية</div>
      <div class="card card-pad-lg" id="samm-ayah-card" style="min-height:120px;text-align:center">
        <div class="font-quran text-lg" id="samm-ayah-text" style="line-height:2.0;color:var(--fg-strong)"></div>
        <div class="text-xs text-muted mt-3" id="samm-status">اضغط «استمع» واقرأ الآية من حفظك</div>
        <div class="text-xs mt-2" id="samm-recognized" style="color:var(--action-color);min-height:18px"></div>
      </div>

      <div class="samm-actions">
        <button class="btn btn-outline" id="samm-hide">
          ${Icons.book} إخفاء الآية
        </button>
        ${supported ? `
          <button class="btn btn-primary" id="samm-listen">
            ${Icons.speaker} ابدأ الاستماع
          </button>
        ` : `
          <button class="btn btn-primary" id="samm-manual-check">
            ${Icons.check} كشف ذاتي
          </button>
        `}
        <button class="btn btn-ghost" id="samm-next">
          ${Icons.chevronLeft} التالية
        </button>
      </div>

      <div class="card card-pad mt-4" style="background:var(--bg-subtle);border-color:transparent">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} ملاحظة: التعرف على الصوت العربي قد يخطئ في الكلمات المتشابهة أو في النطق غير الواضح. اقرأ بوضوح وفي مكان هادئ.
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;

  function renderAyah() {
    const meta = getSurahMeta(state.surah);
    const text = getAyahText(state.surah, state.ayah);
    const words = text.split(/\s+/).filter(Boolean);

    const textEl = container.querySelector('#samm-ayah-text');
    if (state.revealedWords === 0) {
      textEl.innerHTML = '<span style="color:var(--fg-subtle)">— الآية مخفية —</span>';
    } else if (state.revealedWords >= words.length) {
      textEl.innerHTML = words.map((w, i) => {
        const isError = state.errors.includes(i);
        return `<span style="color:${isError ? '#C53030' : 'var(--fg-strong)'};font-weight:${isError ? '700' : '400'}">${escapeHtml(w)}</span>`;
      }).join(' ');
    } else {
      textEl.innerHTML = words.slice(0, state.revealedWords).map(w => escapeHtml(w)).join(' ') +
        ' <span style="color:var(--fg-subtle)">...</span>';
    }
  }

  function loadAyah() {
    const meta = getSurahMeta(state.surah);
    if (state.ayah > meta.ayahCount) state.ayah = meta.ayahCount;
    if (state.ayah < 1) state.ayah = 1;
    state.revealedWords = 0;
    state.errors = [];
    state.recognizedText = '';
    container.querySelector('#samm-ayah').value = state.ayah;
    container.querySelector('#samm-status').textContent = 'اضغط «استمع» واقرأ الآية من حفظك';
    container.querySelector('#samm-recognized').textContent = '';
    renderAyah();
  }

  // Wire up
  container.querySelector('#samm-surah').onchange = (e) => {
    state.surah = Number(e.target.value);
    state.ayah = 1;
    loadAyah();
  };
  container.querySelector('#samm-ayah').onchange = (e) => {
    state.ayah = Number(e.target.value) || 1;
    loadAyah();
  };
  container.querySelector('#samm-ayah-inc').onclick = () => {
    state.ayah++;
    loadAyah();
  };
  container.querySelector('#samm-ayah-dec').onclick = () => {
    state.ayah--;
    loadAyah();
  };
  container.querySelector('#samm-hide').onclick = () => {
    state.revealedWords = 0;
    state.errors = [];
    renderAyah();
    container.querySelector('#samm-status').textContent = 'الآية مخفية. اقرأها من حفظك ثم اضغط «كشف»';
  };
  container.querySelector('#samm-next').onclick = () => {
    state.ayah++;
    loadAyah();
  };

  if (supported) {
    const listenBtn = container.querySelector('#samm-listen');
    let listening = false;

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      const displayText = (finalText + ' ' + interimText).trim();
      container.querySelector('#samm-recognized').textContent = displayText ? 'سمعت: ' + displayText : '';

      if (finalText) {
        state.recognizedText += ' ' + finalText;
        checkRecognition();
      }
    };

    recognition.onend = () => {
      listening = false;
      listenBtn.innerHTML = Icons.speaker + ' ابدأ الاستماع';
      listenBtn.classList.remove('btn-remind');
      listenBtn.classList.add('btn-primary');
      container.querySelector('#samm-status').textContent = 'انتهى الاستماع. نقارن الآن ما سمعناه بالآية.';
      // Reveal all + show errors
      state.revealedWords = 999;
      checkRecognition();
      renderAyah();
    };

    recognition.onerror = (e) => {
      console.warn('Speech error:', e);
      listening = false;
      listenBtn.innerHTML = Icons.speaker + ' ابدأ الاستماع';
      toast('تعذر الوصول للمايك أو حدث خطأ: ' + e.error, 'error');
    };

    listenBtn.onclick = () => {
      if (listening) {
        recognition.stop();
        return;
      }
      try {
        state.revealedWords = 0;
        state.errors = [];
        state.recognizedText = '';
        renderAyah();
        container.querySelector('#samm-status').textContent = '🔴 يستمع... اقرأ الآية الآن';
        container.querySelector('#samm-recognized').textContent = '';
        listenBtn.innerHTML = Icons.pause + ' إيقاف';
        listenBtn.classList.remove('btn-primary');
        listenBtn.classList.add('btn-remind');
        recognition.start();
        listening = true;
      } catch (e) {
        toast('تعذر بدء الاستماع: ' + e.message, 'error');
      }
    };
  } else {
    container.querySelector('#samm-manual-check').onclick = () => {
      state.revealedWords = 999;
      renderAyah();
      container.querySelector('#samm-status').textContent = 'قارن قراءتك بالآية المعروضة. هل وافق حفظك؟';
    };
  }

  function checkRecognition() {
    const text = getAyahText(state.surah, state.ayah);
    const words = text.split(/\s+/).filter(Boolean);
    const recognized = normalize(state.recognizedText);
    const wordList = recognized.split(' ').filter(Boolean);
    state.errors = [];

    for (let i = 0; i < words.length; i++) {
      const w = normalize(words[i]);
      // Find this word (or close match) in recognized text
      let found = false;
      for (let j = Math.max(0, i - 2); j < Math.min(wordList.length, i + 3); j++) {
        if (wordList[j] === w || wordList[j].includes(w) || w.includes(wordList[j])) {
          found = true;
          break;
        }
      }
      if (!found) state.errors.push(i);
    }
  }

  // Initial load
  loadAyah();
}
