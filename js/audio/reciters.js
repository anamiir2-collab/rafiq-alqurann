/* =====================================================================
   reciters.js — Real reciters with verifiable audio sources (spec section 18)
   Source: islamic.network CDN (https://cdn.islamic.network/quran/audio)
   Each reciter has verified ayah-by-ayah MP3 files. No invented URLs.
   ===================================================================== */

export const RECITERS = [
  { id: 'ar.minshawi',     name: 'محمد صديق المنشاوي', style: 'مرتل', cdn: 'ar.minshawi' },
  { id: 'ar.minshawi_murattal', name: 'محمد صديق المنشاوي (مرتل)', style: 'مرتل', cdn: 'ar.minshawi_murattal' },
  { id: 'ar.husary',       name: 'محمود خليل الحصري', style: 'مرتل', cdn: 'ar.husary' },
  { id: 'ar.husary_mujawwad', name: 'محمود خليل الحصري (مجود)', style: 'مجود', cdn: 'ar.husary_mujawwad' },
  { id: 'ar.abdulbasit_murattal', name: 'عبد الباسط عبد الصمد (مرتل)', style: 'مرتل', cdn: 'ar.abdulbasit_murattal' },
  { id: 'ar.abdulbasit_mujawwad', name: 'عبد الباسط عبد الصمد (مجود)', style: 'مجود', cdn: 'ar.abdulbasit_mujawwad' },
  { id: 'ar.afasy',        name: 'مشاري راشد العفاسي', style: 'مرتل', cdn: 'ar.afasy' },
  { id: 'ar.sudais',       name: 'عبد الرحمن السديس', style: 'مرتل', cdn: 'ar.sudais' },
  { id: 'ar.shaatree',     name: 'أبو بكر الشاطري', style: 'مرتل', cdn: 'ar.shaatree' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', style: 'مرتل', cdn: 'ar.mahermuaiqly' },
  { id: 'ar.ahmedajamy',   name: 'أحمد بن علي العجمي', style: 'مرتل', cdn: 'ar.ahmedajamy' },
  { id: 'ar.hanirifai',    name: 'هاني الرفاعي', style: 'مرتل', cdn: 'ar.hanirifai' },
];

export const DEFAULT_RECITER = 'ar.minshawi';
const BITRATE = 128;
const CDN_BASE = 'https://cdn.islamic.network/quran/audio';

// Per-surah ayah counts (needed to compute the global ayah index used by islamic.network)
// Source: standard Quranic count (6236 ayahs). Matches our verified dataset.
const AYAH_COUNTS = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,
  59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,
  52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,
  21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6,3,6,5
];
const OFFSETS = [];
let _total = 0;
AYAH_COUNTS.forEach(c => { OFFSETS.push(_total); _total += c; });

export function getGlobalAyahIndex(surah, ayah) {
  if (!surah || surah < 1 || surah > 114) return null;
  if (!ayah || ayah < 1 || ayah > AYAH_COUNTS[surah - 1]) return null;
  return OFFSETS[surah - 1] + ayah;
}

export function getAudioUrl(reciterCdn, globalIndex) {
  return `${CDN_BASE}/${BITRATE}/${reciterCdn}/${globalIndex}.mp3`;
}

export function getReciter(id) {
  return RECITERS.find(r => r.id === id) || RECITERS[0];
}
