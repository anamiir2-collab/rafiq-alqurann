/* =====================================================================
   رفيق القرآن — نظام الصوت (Quran Audio System)
   Audio Per Ayah - تشغيل آية بآية مع دعم القارئ
   المصدر: EveryAyah API (مجاني ومفتوح)
   ===================================================================== */

'use strict';

// ================== القراء المتاحون ==================
const RECITERS = {
  'mishary_alafasy':    { name: 'مشاري راشد العفاسي',   dir: 'Alafasy_128kbps',         lang: 'ar' },
  'minshawi_murattal':  { name: 'محمد صديق المنشاوي',  dir: 'Minshawy_Murattal_128kbps', lang: 'ar', default: true },
  'minshawi_mujawwad':  { name: 'المنشاوي - تجويد',    dir: 'Minshawy_Mujawwad_192kbps', lang: 'ar' },
  'abdulbasit_murattal':{ name: 'عبد الباسط عبد الصمد', dir: 'Abdul_Basit_Murattal_192kbps', lang: 'ar' },
  'abdulbasit_mujawwad':{ name: 'عبد الباسط - تجويد',  dir: 'Abdul_Basit_Mujawwad_192kbps', lang: 'ar' },
  'husary':             { name: 'محمود خليل الحصري',   dir: 'Husary_128kbps',           lang: 'ar' },
  'sudais':             { name: 'عبد الرحمن السديس',   dir: 'Abdurrahmaan_As-Sudais_192kbps', lang: 'ar' },
  'shuraim':            { name: 'سعود الشريم',          dir: 'Saood_ash-Shuraym_128kbps', lang: 'ar' },
  'maher_muaiqly':      { name: 'ماهر المعيقلي',        dir: 'MaherAlMuaiqy128kbps',     lang: 'ar' },
  'ahmed_neana':        { name: 'أحمد نعينع',           dir: 'Ahmed_ibn_Ali_al-Ajamy_128kbps', lang: 'ar' },
};

const DEFAULT_RECITER = 'minshawi_murattal';
const RECITER_KEY = 'rafiq_reciter';
const REPEAT_KEY = 'rafiq_repeat';

// ================== حالة الصوت ==================
const AudioState = {
  audio: null,
  currentSurah: null,
  currentAyah: null,
  reciter: localStorage.getItem(RECITER_KEY) || DEFAULT_RECITER,
  repeat: parseInt(localStorage.getItem(REPEAT_KEY) || '1', 10),
  repeatCount: 0,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  playlist: [],      // قائمة الآيات الحالية
  playlistIdx: 0,
  onStateChange: null,
};

// ================== بناء URL للآية ==================
function getAyahAudioUrl(surah, ayah) {
  const reciter = RECITERS[AudioState.reciter] || RECITERS[DEFAULT_RECITER];
  const surahStr = String(surah).padStart(3, '0');
  const ayahStr = String(ayah).padStart(3, '0');
  // محاولة أول: EveryAyah (MP3 بجودة عالية)
  return `https://everyayah.com/data/${reciter.dir}/${surahStr}${ayahStr}.mp3`;
}

// محاولة بديلة: Quran CDN
function getAyahAudioUrlAlt(surah, ayah) {
  const reciter = AudioState.reciter;
  // مصدر بديل - AlQuran Cloud
  const cdnMap = {
    'minshawi_murattal': 'ar.minshawi',
    'mishary_alafasy': 'ar.alafasy',
    'abdulbasit_murattal': 'ar.abdulbasitmurattal',
    'husary': 'ar.husary',
    'sudais': 'ar.abdurrahmaansudais',
  };
  const edition = cdnMap[reciter] || 'ar.minshawi';
  return `https://cdn.islamic.network/quran/audio/128/${edition}/${getAyahGlobalNumber(surah, ayah)}.mp3`;
}

// حساب الرقم العالمي للآية (للاستخدام مع CDN البديل)
function getAyahGlobalNumber(surah, ayah) {
  // بيانات عدد آيات كل سورة
  const surahAyahCounts = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,3,9,5,4,7,3,6,3,5,4,5,6];
  let num = 0;
  for (let i = 0; i < surah - 1; i++) num += surahAyahCounts[i];
  return num + ayah;
}

// ================== تشغيل آية واحدة ==================
function playAyah(surah, ayah, options = {}) {
  stopAudio();
  AudioState.currentSurah = surah;
  AudioState.currentAyah = ayah;
  AudioState.audio = new Audio(getAyahAudioUrl(surah, ayah));

  AudioState.audio.addEventListener('loadedmetadata', () => {
    AudioState.duration = AudioState.audio.duration;
    notifyStateChange();
  });

  AudioState.audio.addEventListener('timeupdate', () => {
    AudioState.currentTime = AudioState.audio.currentTime;
    notifyStateChange();
  });

  AudioState.audio.addEventListener('ended', () => {
    AudioState.repeatCount++;
    if (AudioState.repeatCount < AudioState.repeat) {
      // تكرار نفس الآية
      AudioState.audio.currentTime = 0;
      AudioState.audio.play().catch(() => {});
    } else {
      AudioState.repeatCount = 0;
      // الانتقال للآية التالية إن وجدت في القائمة
      if (options.autoNext !== false && AudioState.playlist.length > 0) {
        nextAyah();
      } else {
        AudioState.isPlaying = false;
        notifyStateChange();
      }
    }
  });

  AudioState.audio.addEventListener('error', () => {
    // محاولة بالمصدر البديل
    if (AudioState.audio && !AudioState.audio._altTried) {
      AudioState.audio._altTried = true;
      try { AudioState.audio.pause(); } catch(e) {}
      AudioState.audio = new Audio(getAyahAudioUrlAlt(surah, ayah));
      AudioState.audio.addEventListener('ended', () => {
        if (options.autoNext !== false && AudioState.playlist.length > 0) nextAyah();
        else { AudioState.isPlaying = false; notifyStateChange(); }
      });
      AudioState.audio.play().catch(() => {
        toast('تعذر تشغيل الصوت', 'error');
        AudioState.isPlaying = false;
        notifyStateChange();
      });
    } else {
      toast('تعذر تشغيل الصوت', 'error');
      AudioState.isPlaying = false;
      notifyStateChange();
    }
  });

  AudioState.audio.play().then(() => {
    AudioState.isPlaying = true;
    notifyStateChange();
  }).catch(() => {
    AudioState.isPlaying = false;
    notifyStateChange();
  });
}

// ================== تشغيل قائمة آيات ==================
function playAyahRange(surah, fromAyah, toAyah) {
  const playlist = [];
  for (let a = fromAyah; a <= toAyah; a++) playlist.push({ surah, ayah: a });
  AudioState.playlist = playlist;
  AudioState.playlistIdx = 0;
  playAyahFromPlaylist();
}

function playSurahFull(surah) {
  const meta = getSurahMeta(surah);
  if (!meta) return;
  playAyahRange(surah, 1, meta.ayahCount);
}

function playAyahFromPlaylist() {
  if (AudioState.playlistIdx >= AudioState.playlist.length) {
    AudioState.isPlaying = false;
    AudioState.playlist = [];
    AudioState.playlistIdx = 0;
    notifyStateChange();
    return;
  }
  const item = AudioState.playlist[AudioState.playlistIdx];
  playAyah(item.surah, item.ayah, { autoNext: false });
  // بعد انتهاء الآية، الانتقال للتالي (مدموج في playAyah عبر nextAyah)
}

function nextAyah() {
  if (AudioState.playlist.length === 0) return;
  AudioState.playlistIdx++;
  if (AudioState.playlistIdx >= AudioState.playlist.length) {
    AudioState.isPlaying = false;
    AudioState.playlist = [];
    AudioState.playlistIdx = 0;
    notifyStateChange();
    return;
  }
  playAyahFromPlaylist();
}

function prevAyah() {
  if (AudioState.playlist.length === 0) return;
  AudioState.playlistIdx = Math.max(0, AudioState.playlistIdx - 1);
  playAyahFromPlaylist();
}

// ================== تحكم أساسي ==================
function pauseAudio() {
  if (AudioState.audio && AudioState.isPlaying) {
    AudioState.audio.pause();
    AudioState.isPlaying = false;
    notifyStateChange();
  }
}

function resumeAudio() {
  if (AudioState.audio && !AudioState.isPlaying) {
    AudioState.audio.play().then(() => {
      AudioState.isPlaying = true;
      notifyStateChange();
    }).catch(() => {});
  }
}

function togglePlayPause() {
  if (AudioState.isPlaying) pauseAudio();
  else resumeAudio();
}

function stopAudio() {
  if (AudioState.audio) {
    try {
      AudioState.audio.pause();
      AudioState.audio.src = '';
    } catch(e) {}
  }
  AudioState.audio = null;
  AudioState.isPlaying = false;
  AudioState.currentTime = 0;
  AudioState.duration = 0;
  notifyStateChange();
}

function seekAudio(time) {
  if (AudioState.audio) {
    AudioState.audio.currentTime = time;
    AudioState.currentTime = time;
    notifyStateChange();
  }
}

function setReciter(reciterKey) {
  if (!RECITERS[reciterKey]) return;
  AudioState.reciter = reciterKey;
  localStorage.setItem(RECITER_KEY, reciterKey);
  // إعادة تشغيل الآية الحالية بالقارئ الجديد
  if (AudioState.currentSurah && AudioState.currentAyah) {
    const wasPlaying = AudioState.isPlaying;
    playAyah(AudioState.currentSurah, AudioState.currentAyah);
  }
}

function setRepeat(count) {
  AudioState.repeat = Math.max(1, Math.min(10, count));
  localStorage.setItem(REPEAT_KEY, String(AudioState.repeat));
  notifyStateChange();
}

// ================== حالة الصوت ==================
function getAudioState() {
  return {
    isPlaying: AudioState.isPlaying,
    currentSurah: AudioState.currentSurah,
    currentAyah: AudioState.currentAyah,
    reciter: AudioState.reciter,
    reciterName: RECITERS[AudioState.reciter]?.name || '',
    duration: AudioState.duration,
    currentTime: AudioState.currentTime,
    repeat: AudioState.repeat,
    playlistLength: AudioState.playlist.length,
    playlistIdx: AudioState.playlistIdx,
  };
}

function onAudioStateChange(callback) {
  AudioState.onStateChange = callback;
}

function notifyStateChange() {
  if (AudioState.onStateChange) {
    AudioState.onStateChange(getAudioState());
  }
  // تحديث UI لمشغل الصوت إن كان معروضاً
  if (typeof updateAudioPlayerUI === 'function') {
    updateAudioPlayerUI(getAudioState());
  }
}

// ================== تنسيق الوقت ==================
function formatAudioTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
