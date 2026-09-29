/* =====================================================================
   listening.js — الاستماع (spec section 29)
   Audio-focused view: reciter + surah + current ayah + progress + highlight + auto-scroll
   ===================================================================== */

import { Icons } from '../../components/icons.js';
import { State } from '../state.js';
import { loadQuran, getSurahs, getSurahMeta, getAyahText, getSurahAyahs } from '../quran/quran-data.js';
import { playAyah, pause, resume, next, previous, stop, setAutoplay, setReciter, setRepeat } from '../audio/audio-player.js';
import { RECITERS, DEFAULT_RECITER, getReciter } from '../audio/reciters.js';
import { openSheet, closeSheet } from '../../components/bottom-sheet.js';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

export async function renderListening(container) {
  await loadQuran();
  const audio = State.getSlice('audio');
  const surahs = getSurahs();
  const currentSurah = audio.current?.surah || State.getSlice('quran').lastSurah || 1;
  const currentAyah = audio.current?.ayah || 1;
  const meta = getSurahMeta(currentSurah);

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الاستماع</h2>
      </div>

      <div class="listening-hero card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div class="text-xs text-muted">السورة الحالية</div>
        <div class="font-quran" style="font-size:32px;font-weight:700;color:var(--fg-strong);margin-top:4px">${escapeHtml(meta?.name || '')}</div>
        <div class="text-sm text-muted mt-1">${meta?.revelationType === 'meccan' ? 'مكية' : 'مدنية'} • ${toAr(meta?.ayahCount || 0)} آية</div>

        <div class="listening-current-ayah" id="listening-current">
          <div class="font-quran" style="font-size:22px;line-height:1.9;color:var(--quran-color);margin:16px 0 8px">
            ${escapeHtml(getAyahText(currentSurah, currentAyah))}
          </div>
          <div class="text-xs text-muted">آية ${toAr(currentAyah)}</div>
        </div>

        <div class="listening-controls">
          <button class="btn-icon" id="lst-prev" aria-label="السابق">${Icons.prev}</button>
          <button class="btn-icon play-btn" id="lst-play" aria-label="تشغيل">${Icons.play}</button>
          <button class="btn-icon" id="lst-next" aria-label="التالي">${Icons.next}</button>
          <button class="btn-icon" id="lst-stop" aria-label="إيقاف">${Icons.close}</button>
        </div>

        <div class="listening-options mt-3">
          <button class="badge" style="cursor:pointer;padding:8px 14px" id="lst-reciter">
            ${Icons.speaker} ${escapeHtml(getReciter(audio.reciter || DEFAULT_RECITER).name)}
          </button>
          <button class="badge" style="cursor:pointer;padding:8px 14px" id="lst-repeat">
            ${Icons.repeat} ${audio.repeat === 'one' ? 'تكرار الآية' : audio.repeat === 'all' ? 'تكرار الكل' : 'بدون تكرار'}
          </button>
          <button class="badge ${audio.autoplay !== false ? 'badge-action' : ''}" style="cursor:pointer;padding:8px 14px" id="lst-autoplay">
            ${Icons.play} تلقائي ${audio.autoplay !== false ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div class="divider-label">اختر سورة للاستماع</div>
      <div class="surah-index-search" style="position:static;margin-bottom:12px">
        <div class="search-wrap">
          <input type="search" class="input" id="lst-search" placeholder="ابحث عن سورة..." autocomplete="off" />
          <span class="search-icon">${Icons.search}</span>
        </div>
      </div>

      <div class="list" id="lst-list">
        ${surahs.slice(0, 30).map(s => `
          <button class="row" data-surah="${s.number}" ${s.number === currentSurah ? 'style="background:color-mix(in srgb,var(--c-blue) 10%,transparent)"' : ''}>
            <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center;font-weight:700">${toAr(s.number)}</div>
            <div class="row-body">
              <div class="row-title font-quran" style="font-size:18px">${escapeHtml(s.name)}</div>
              <div class="row-sub">${toAr(s.ayahCount)} آية</div>
            </div>
            <div class="row-trail">${Icons.play}</div>
          </button>
        `).join('')}
      </div>

      <div style="height:32px"></div>
    </div>
  `;

  const playBtn = container.querySelector('#lst-play');
  const updatePlayIcon = () => {
    const isPlaying = State.getSlice('audio').isPlaying;
    playBtn.innerHTML = isPlaying ? Icons.pause : Icons.play;
  };
  updatePlayIcon();
  // Subscribe to audio state changes
  const unsub = State.subscribe('audio', () => updatePlayIcon());

  // Play button — toggle play/pause of current ayah
  playBtn.onclick = async () => {
    const a = State.getSlice('audio');
    if (a.current) {
      if (a.isPlaying) pause();
      else await resume();
    } else {
      await playAyah(currentSurah, currentAyah);
    }
  };

  container.querySelector('#lst-prev').onclick = () => previous();
  container.querySelector('#lst-next').onclick = () => next();
  container.querySelector('#lst-stop').onclick = () => stop();

  // Reciter picker
  container.querySelector('#lst-reciter').onclick = () => {
    const rows = RECITERS.map(r => `
      <div class="reciter-row ${r.id === (audio.reciter || DEFAULT_RECITER) ? 'selected' : ''}" data-reciter="${r.id}">
        <div class="reciter-icon">${Icons.speaker}</div>
        <div class="reciter-info">
          <div class="reciter-name">${escapeHtml(r.name)}</div>
          <div class="reciter-style">${escapeHtml(r.style)}</div>
        </div>
        <div class="reciter-check">${Icons.check}</div>
      </div>
    `).join('');
    openSheet({
      title: 'اختر القارئ',
      body: `<div class="reciter-list">${rows}</div>`,
    });
    setTimeout(() => {
      document.querySelectorAll('.reciter-row').forEach(row => {
        row.onclick = () => {
          setReciter(row.getAttribute('data-reciter'));
          closeSheet();
        };
      });
    }, 50);
  };

  // Repeat cycle
  container.querySelector('#lst-repeat').onclick = () => {
    const cur = State.getSlice('audio').repeat;
    const next = cur === 'off' ? 'one' : cur === 'one' ? 'all' : 'off';
    setRepeat(next);
    renderListening(container);
  };

  // Autoplay toggle
  container.querySelector('#lst-autoplay').onclick = () => {
    const cur = State.getSlice('audio').autoplay !== false;
    setAutoplay(!cur);
    renderListening(container);
  };

  // Surah list — pick a surah to start playing from ayah 1
  container.querySelectorAll('[data-surah]').forEach(btn => {
    btn.onclick = async () => {
      const surah = Number(btn.getAttribute('data-surah'));
      await playAyah(surah, 1);
      // Re-render to show new current
      setTimeout(() => renderListening(container), 500);
    };
  });

  // Search filter
  const search = container.querySelector('#lst-search');
  const list = container.querySelector('#lst-list');
  search.addEventListener('input', (e) => {
    const f = e.target.value.trim().toLowerCase();
    const items = surahs.filter(s => !f || s.name.toLowerCase().includes(f) || s.englishName.toLowerCase().includes(f) || String(s.number).includes(f));
    list.innerHTML = items.slice(0, 30).map(s => `
      <button class="row" data-surah="${s.number}">
        <div class="row-icon" style="width:42px;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center;font-weight:700">${toAr(s.number)}</div>
        <div class="row-body">
          <div class="row-title font-quran" style="font-size:18px">${escapeHtml(s.name)}</div>
          <div class="row-sub">${toAr(s.ayahCount)} آية</div>
        </div>
        <div class="row-trail">${Icons.play}</div>
      </button>
    `).join('') || '<div class="empty-state"><div class="empty-state-text">لا توجد نتائج</div></div>';
    // Re-wire
    list.querySelectorAll('[data-surah]').forEach(btn => {
      btn.onclick = async () => {
        const surah = Number(btn.getAttribute('data-surah'));
        await playAyah(surah, 1);
        setTimeout(() => renderListening(container), 500);
      };
    });
  });
}
