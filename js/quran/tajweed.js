/* =====================================================================
   tajweed.js — Tajweed rule detection engine (spec section 14)
   ---------------------------------------------------------------------
   Algorithmically detects Tajweed rules in Uthmani Quran text and wraps
   relevant character sequences with semantic CSS classes for coloring.

   Rules detected (spec section 14):
     - Madd     (مد):    elongation letters (ا after fatha, و after damma, ي after kasra)
     - Ghunnah  (غنة):   nun/mim with shadda (نّ / مّ)
     - Qalqalah (قلقلة): qaf/tat/ba/jim/dal with sukun (ق ط ب ج د)
     - Idgham   (إدغام): nun sakinah + يرملون
     - Iqlab    (إقلاب): nun sakinah + ب
     - Ikhfa    (إخفاء): nun sakinah + 15 specific letters
     - Idhar    (إظهار): nun sakinah + throat letters (ء ه ع ح غ خ)
     - Mim Sakinah rules (إخفاء/إدغام/إظهار الميم الساكنة)

   CRITICAL (spec section 14): "التجويد يجب ألا يغير النص القرآني"
   → This module NEVER modifies text. It only wraps substrings with
     <span class="taj-X">...</span>. The Quran text is preserved verbatim.
   ===================================================================== */

/* Tajweed CSS classes — colors defined in css/variables.css */
export const TAJWEED_RULES = {
  madd:     { id: 'madd',     label: 'المد',            color: 'var(--taj-madd)',     desc: 'إطالة الصوت بحرف المد' },
  ghunnah:  { id: 'ghunnah',  label: 'الغنة',           color: 'var(--taj-ghunnah)',  desc: 'صوت يخرج من الأنف' },
  qalqalah: { id: 'qalqalah', label: 'القلقلة',         color: 'var(--taj-qalqalah)', desc: 'إظهار الحرف بصوت قوي عند سكونه' },
  idgham:   { id: 'idgham',   label: 'الإدغام',         color: 'var(--taj-idgham)',   desc: 'دمج النون الساكنة بالحرف بعدها' },
  iqlab:    { id: 'iqlab',    label: 'الإقلاب',         color: 'var(--taj-iqlab)',    desc: 'قلب النون الساكنة ميماً قبل الباء' },
  ikhfa:    { id: 'ikhfa',    label: 'الإخفاء',         color: 'var(--taj-ikhfa)',    desc: 'إخفاء النون الساكنة مع غنة' },
  idhar:    { id: 'idhar',    label: 'الإظهار',         color: 'var(--taj-idhar)',    desc: 'إظهار النون الساكنة قبل حروف الحلق' },
};

const THROAT_LETTERS = ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'];           // إظهار
const IDGHAM_LETTERS = ['ي', 'ر', 'م', 'ل', 'و', 'ن'];           // إدغام (يرملون)
const IKHFA_LETTERS = ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك']; // إخفاء (15)
const QALQALAH_LETTERS = ['ق', 'ط', 'ب', 'ج', 'د'];

const NUN = 'ن';
const MIM = 'م';
const ALIF = 'ا';
const WAW = 'و';
const YA = 'ي';
const SHADDA = 'ّ';
const SUKUN = 'ْ';
const FATHA = 'َ';
const KASRA = 'ِ';
const DAMMA = 'ُ';

/* Diacritics to skip when scanning for next consonant */
const DIACRITICS = /[ًٌٍَُِّْٰـ]/g;
const TATWEEL = 'ـ';

function stripDiacritics(s) {
  return s.replace(DIACRITICS, '').replace(new RegExp(TATWEEL, 'g'), '');
}

/**
 * Analyze a single word and produce tajweed segments.
 * Returns: { original: string, segments: [{ text, rule }] }
 *
 * Strategy: scan the word left-to-right; for each position check
 * applicable rules. Rules are layered (multiple can apply).
 * We return SEGMENTS so the renderer can wrap each substring.
 */
export function analyzeWord(word) {
  if (!word || word.length < 2) {
    return { original: word, segments: word ? [{ text: word, rule: null }] : { original: '', segments: [] } };
  }

  const segments = [];
  let i = 0;
  const n = word.length;

  while (i < n) {
    const ch = word[i];
    const next = word[i + 1] || '';
    const next2 = word[i + 2] || '';
    const prev = i > 0 ? word[i - 1] : '';

    /* ===== Rule 1: Qalqalah — ق ط ب ج د with sukun ===== */
    if (QALQALAH_LETTERS.includes(ch)) {
      const hasSukun = next === SUKUN ||
                       (i === n - 1) || // end of word = implied sukun
                       (next === SHADDA);
      if (hasSukun) {
        // Include the letter + its diacritics
        let end = i + 1;
        while (end < n && /[ًٌٍَُِّْٰ]/.test(word[end])) end++;
        segments.push({ text: word.slice(i, end), rule: 'qalqalah' });
        i = end;
        continue;
      }
    }

    /* ===== Rule 2: Ghunnah — نّ or مّ (shadda after nun/mim) ===== */
    if ((ch === NUN || ch === MIM) && next === SHADDA) {
      let end = i + 2;
      while (end < n && /[ًٌٍَُِّْٰ]/.test(word[end])) end++;
      segments.push({ text: word.slice(i, end), rule: 'ghunnah' });
      i = end;
      continue;
    }

    /* ===== Rule 3: Nun Sakinah rules (إدغام / إقلاب / إخفاء / إظهار) ===== */
    if (ch === NUN && next === SUKUN) {
      // Find next actual consonant (skip any extra diacritics)
      let j = i + 2;
      while (j < n && /[ًٌٍَُِّْٰـ]/.test(word[j])) j++;
      const nextCons = word[j] || '';

      if (nextCons === 'ب') {
        // Iqlab
        let end = j + 1;
        while (end < n && /[ًٌٍَُِّْٰ]/.test(word[end])) end++;
        segments.push({ text: word.slice(i, end), rule: 'iqlab' });
        i = end;
        continue;
      } else if (IDGHAM_LETTERS.includes(nextCons)) {
        let end = j + 1;
        while (end < n && /[ًٌٍَُِّْٰ]/.test(word[end])) end++;
        segments.push({ text: word.slice(i, end), rule: 'idgham' });
        i = end;
        continue;
      } else if (IKHFA_LETTERS.includes(nextCons)) {
        let end = j + 1;
        while (end < n && /[ًٌٍَُِّْٰ]/.test(word[end])) end++;
        segments.push({ text: word.slice(i, end), rule: 'ikhfa' });
        i = end;
        continue;
      } else if (THROAT_LETTERS.includes(nextCons)) {
        // Idhar — only the nun+sukun gets colored
        segments.push({ text: word.slice(i, i + 2), rule: 'idhar' });
        i += 2;
        continue;
      }
    }

    /* ===== Rule 4: Mim Sakinah rules ===== */
    if (ch === MIM && next === SUKUN) {
      let j = i + 2;
      while (j < n && /[ًٌٍَُِّْٰـ]/.test(word[j])) j++;
      const nextCons = word[j] || '';

      if (nextCons === 'ب') {
        // Ikhfa Shafawi (mouth hiding)
        let end = j + 1;
        while (end < n && /[ًٌٍَُِّْٰ]/.test(word[end])) end++;
        segments.push({ text: word.slice(i, end), rule: 'ikhfa' });
        i = end;
        continue;
      } else if (nextCons === 'م') {
        // Idgham Shafawi
        let end = j + 1;
        while (end < n && /[ًٌٍَُِّْٰ]/.test(word[end])) end++;
        segments.push({ text: word.slice(i, end), rule: 'idgham' });
        i = end;
        continue;
      }
      // Otherwise Idhar Shafawi — no special coloring (rule: idhar would be too noisy)
    }

    /* ===== Rule 5: Madd — ا/و/ي after fatha/damma/kasra ===== */
    if (ch === ALIF && prev === FATHA) {
      segments.push({ text: word.slice(i - 1, i + 1), rule: 'madd' });
      i += 1;
      continue;
    }
    if (ch === WAW && prev === DAMMA) {
      segments.push({ text: word.slice(i - 1, i + 1), rule: 'madd' });
      i += 1;
      continue;
    }
    if (ch === YA && prev === KASRA) {
      segments.push({ text: word.slice(i - 1, i + 1), rule: 'madd' });
      i += 1;
      continue;
    }

    /* No rule applied at this position — emit single char as plain */
    segments.push({ text: ch, rule: null });
    i += 1;
  }

  /* Coalesce adjacent plain segments */
  const merged = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && last.rule === null && seg.rule === null) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }

  return { original: word, segments: merged };
}

/**
 * Render a word's text with tajweed coloring.
 * Returns HTML string with <span class="taj-X"> wrappers.
 * NEVER modifies the underlying text.
 */
export function renderWordWithTajweed(word) {
  const { segments } = analyzeWord(word);
  let html = '';
  for (const seg of segments) {
    if (seg.rule) {
      html += `<span class="taj-${seg.rule}">${escapeHtml(seg.text)}</span>`;
    } else {
      html += escapeHtml(seg.text);
    }
  }
  return html;
}

/* Escape HTML special chars (preserve Arabic untouched) */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Quick check: does this word contain any tajweed rules?
 * Used by the index for performance to skip simple words.
 */
export function hasTajweed(word) {
  if (!word || word.length < 2) return false;
  return /نّ|مّ|نْ|مْ|ـَا|ـُو|ـِي|قْ|طْ|بْ|جْ|دْ/.test(word) ||
         /قْ$|طْ$|بْ$|جْ$|دْ$/.test(word);
}
