/* =====================================================================
   audio-player.js — Unified audio engine (spec sections 16, 17)
   - Play / Pause / Resume / Stop / Previous / Next / Repeat / Speed
   - Auto-play (queue) — no manual Next required
   - Anti-duplication (spec section 17): one source of truth for current ayah
   - Highlights current ayah + word
   - Saves last position
   ===================================================================== */

import { State } from '../state.js';
import { Storage } from '../storage.js';
import { RECITERS, DEFAULT_RECITER, getReciter, getGlobalAyahIndex, getAudioUrl } from './reciters.js';
import { getSurahMeta } from '../quran/quran-data.js';
import { Icons } from '../../components/icons.js';
import { openSheet, closeSheet } from '../../components/bottom-sheet.js';

/* Re-export so consumers can import everything from audio-player.js */
export { RECITERS, DEFAULT_RECITER, getReciter };

let audioEl = null;
let currentSurah = null;
let currentAyah = null;
let isPlayingFlag = false;
let audioBarEl = null;
let progressTimer = null;
let pendingClickSameAyah = false;

/* ============ Public API ============ */
export function initAudio() {
  if (audioEl) return;
  audioEl = new Audio();
  audioEl.preload = 'auto';

  audioEl.addEventListener('ended', () => onAyahEnded());
  audioEl.addEventListener('error', (e) => {
    console.warn('Audio error', e);
    State.setSlice('audio', { isPlaying: false });
    isPlayingFlag = false;
    updateBar();
  });
  audioEl.addEventListener('play', () => {
    State.setSlice('audio', { isPlaying: true });
    isPlayingFlag = true;
    startProgressTimer();
    updateBar();
  });
  audioEl.addEventListener('pause', () => {
    State.setSlice('audio', { isPlaying: false });
    isPlayingFlag = false;
    stopProgressTimer();
    updateBar();
  });
}

export async function playAyah(surah, ayah) {
  if (!surah || !ayah) return;
  initAudio();

  // Anti-duplication (spec section 17)
  if (currentSurah === surah && currentAyah === ayah) {
    // Same ayah clicked again → toggle pause/resume
    if (audioEl.paused) {
      try { await audioEl.play(); } catch (e) { console.warn(e); }
    } else {
      audioEl.pause();
    }
    return;
  }

  // Stop current, switch to new
  audioEl.pause();
  audioEl.removeAttribute('src');
  audioEl.load();

  const audio = State.getSlice('audio');
  const reciter = getReciter(audio.reciter || DEFAULT_RECITER);
  const globalIdx = getGlobalAyahIndex(surah, ayah);
  if (!globalIdx) {
    console.warn('Invalid ayah for audio:', surah, ayah);
    return;
  }

  const url = getAudioUrl(reciter.cdn, globalIdx);
  audioEl.src = url;
  audioEl.playbackRate = audio.speed || 1;

  currentSurah = surah;
  currentAyah = ayah;
  State.setSlice('audio', {
    current: { surah, ayah },
    isPlaying: false,
    lastPosition: { surah, ayah, currentTime: 0 },
  });

  try {
    await audioEl.play();
  } catch (e) {
    console.warn('play() rejected (likely needs user gesture):', e);
  }

  highlightCurrentAyah(surah, ayah);
  showAudioBar();
}

export function pause() { if (audioEl) audioEl.pause(); }
export async function resume() { if (audioEl && audioEl.paused) { try { await audioEl.play(); } catch {} } }
export function stop() {
  if (!audioEl) return;
  audioEl.pause();
  audioEl.currentTime = 0;
  currentSurah = null; currentAyah = null;
  State.setSlice('audio', { current: null, isPlaying: false });
  hideAudioBar();
  clearHighlights();
}

export async function next() {
  if (!currentSurah || !currentAyah) return;
  const meta = getSurahMeta(currentSurah);
  if (!meta) return;
  if (currentAyah < meta.ayahCount) {
    await playAyah(currentSurah, currentAyah + 1);
  } else if (currentSurah < 114) {
    await playAyah(currentSurah + 1, 1);
  } else {
    stop();
  }
}

export async function previous() {
  if (!currentSurah || !currentAyah) return;
  if (currentAyah > 1) {
    await playAyah(currentSurah, currentAyah - 1);
  } else if (currentSurah > 1) {
    const prevMeta = getSurahMeta(currentSurah - 1);
    if (prevMeta) await playAyah(currentSurah - 1, prevMeta.ayahCount);
  }
}

export function setReciter(reciterId) {
  State.setSlice('audio', { reciter: reciterId });
  // If currently playing, restart current ayah with new reciter
  if (currentSurah && currentAyah && isPlayingFlag) {
    const wasPlaying = true;
    audioEl.pause();
    const reciter = getReciter(reciterId);
    const url = getAudioUrl(reciter.cdn, getGlobalAyahIndex(currentSurah, currentAyah));
    audioEl.src = url;
    if (wasPlaying) audioEl.play().catch(() => {});
  }
}

export function setRepeat(mode) { State.setSlice('audio', { repeat: mode }); }
export function setSpeed(s) {
  State.setSlice('audio', { speed: s });
  if (audioEl) audioEl.playbackRate = s;
}
export function setAutoplay(v) { State.setSlice('audio', { autoplay: !!v }); }

/* ============ Internal: queue / autoplay ============ */
async function onAyahEnded() {
  const audio = State.getSlice('audio');
  // Repeat one
  if (audio.repeat === 'one') {
    audioEl.currentTime = 0;
    try { await audioEl.play(); } catch {}
    return;
  }
  // Autoplay next (spec section 16: "تنتقل الآيات تلقائيًا")
  if (audio.autoplay !== false) {
    await next();
  } else {
    State.setSlice('audio', { isPlaying: false });
    isPlayingFlag = false;
    updateBar();
  }
}

/* ============ Highlighting ============ */
function highlightCurrentAyah(surah, ayah) {
  clearHighlights();
  const ayahRow = document.querySelector(`#ayah-${surah}-${ayah}`);
  if (ayahRow) {
    ayahRow.classList.add('active');
    ayahRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  // Highlight first word as a subtle "playing" indicator
  const firstWord = ayahRow?.querySelector('.ayah-word');
  if (firstWord) firstWord.classList.add('playing');
}

function clearHighlights() {
  document.querySelectorAll('.ayah-row.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.ayah-word.playing').forEach(el => el.classList.remove('playing'));
}

/* ============ Audio bar UI ============ */
function showAudioBar() {
  if (!audioBarEl) {
    audioBarEl = document.createElement('div');
    audioBarEl.className = 'audio-bar';
    audioBarEl.innerHTML = `
      <div class="audio-bar-info">
        <div class="audio-bar-surah" id="audio-bar-surah"></div>
        <div class="audio-bar-reciter" id="audio-bar-reciter"></div>
      </div>
      <div class="audio-bar-controls">
        <button class="audio-bar-btn" id="audio-prev" aria-label="السابق">${Icons.prev}</button>
        <button class="audio-bar-btn play" id="audio-play" aria-label="تشغيل/إيقاف">${Icons.pause}</button>
        <button class="audio-bar-btn" id="audio-next" aria-label="التالي">${Icons.next}</button>
        <button class="audio-bar-btn" id="audio-reciter" aria-label="القارئ">${Icons.speaker}</button>
      </div>
      <div class="audio-bar-progress"><div class="audio-bar-progress-bar" id="audio-progress" style="width:0"></div></div>
    `;
    document.body.appendChild(audioBarEl);

    audioBarEl.querySelector('#audio-play').addEventListener('click', () => {
      if (audioEl.paused) resume(); else pause();
    });
    audioBarEl.querySelector('#audio-prev').addEventListener('click', previous);
    audioBarEl.querySelector('#audio-next').addEventListener('click', next);
    audioBarEl.querySelector('#audio-reciter').addEventListener('click', openReciterPicker);
  }
  requestAnimationFrame(() => audioBarEl.classList.add('open'));
  updateBar();
}

function hideAudioBar() {
  if (audioBarEl) audioBarEl.classList.remove('open');
}

function updateBar() {
  if (!audioBarEl) return;
  const audio = State.getSlice('audio');
  const meta = getSurahMeta(currentSurah);
  const reciter = getReciter(audio.reciter);
  audioBarEl.querySelector('#audio-bar-surah').textContent =
    meta ? `${meta.name} • آية ${toAr(currentAyah)}` : '';
  audioBarEl.querySelector('#audio-bar-reciter').textContent = reciter.name;
  audioBarEl.querySelector('#audio-play').innerHTML = isPlayingFlag ? Icons.pause : Icons.play;
}

function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(() => {
    if (!audioEl || !audioEl.duration) return;
    const pct = (audioEl.currentTime / audioEl.duration) * 100;
    const bar = audioBarEl?.querySelector('#audio-progress');
    if (bar) bar.style.width = `${pct}%`;
  }, 250);
}
function stopProgressTimer() {
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

/* ============ Reciter picker ============ */
export function openReciterPicker() {
  const audio = State.getSlice('audio');
  const current = audio.reciter || DEFAULT_RECITER;
  const rows = RECITERS.map(r => `
    <div class="reciter-row ${r.id === current ? 'selected' : ''}" data-reciter="${r.id}">
      <div class="reciter-icon">${Icons.speaker}</div>
      <div class="reciter-info">
        <div class="reciter-name">${r.name}</div>
        <div class="reciter-style">${r.style}</div>
      </div>
      <div class="reciter-check">${Icons.check}</div>
    </div>
  `).join('');

  openSheet({
    title: 'اختر القارئ',
    body: `<div class="reciter-list">${rows}</div>`,
  });

  // Wire up
  setTimeout(() => {
    document.querySelectorAll('.reciter-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-reciter');
        setReciter(id);
        closeSheet();
        // Refresh UI
        document.querySelectorAll('.reciter-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
      });
    });
  }, 50);
}

/* ============ Expose for inline handlers ============ */
window.__playAyah = (surah, ayah) => playAyah(Number(surah), Number(ayah));
window.__openReciterPicker = openReciterPicker;

/* ============ Helpers ============ */
const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
