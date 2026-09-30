/* =====================================================================
   icons.js — SVG icon library (spec section 62)
   NO emoji as primary UI icons. Lucide-style 24×24 outline icons.
   ===================================================================== */

const wrap = (paths, opts = {}) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${opts.size ? `width="${opts.size}" height="${opts.size}"` : ''} aria-hidden="true">${paths}</svg>`;

export const Icons = {
  /* ===== Navigation (5 main sections) ===== */
  home:        wrap(`<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>`),
  book:        wrap(`<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/>`),
  bookOpen:    wrap(`<path d="M12 7v14"/><path d="M3 5v14h7"/><path d="M3 5h6a3 3 0 0 1 3 3v14"/><path d="M21 5v14h-7"/><path d="M21 5h-6a3 3 0 0 0-3 3v14"/>`),
  quran:       wrap(`<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>`),
  wird:        wrap(`<path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/><path d="M12 7V3"/><path d="M9 5h6"/>`),
  reflect:     wrap(`<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.5.4.8.9.9 1.5l.1 1.8h6l.1-1.8c.1-.6.4-1.1.9-1.5A7 7 0 0 0 12 2Z"/>`),
  more:        wrap(`<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>`),

  /* ===== Common actions ===== */
  search:      wrap(`<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>`),
  settings:    wrap(`<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>`),
  sun:         wrap(`<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>`),
  sunrise:     wrap(`<path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><path d="M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M8 6l4-4 4 4M1 22h22"/>`),
  sunset:      wrap(`<path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><path d="M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M8 6l4 4 4-4M1 22h22"/>`),
  moon:        wrap(`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`),
  monitor:     wrap(`<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>`),
  chevronLeft: wrap(`<path d="m15 18-6-6 6-6"/>`),
  chevronRight:wrap(`<path d="m9 18 6-6-6-6"/>`),
  chevronUp:   wrap(`<path d="m18 15-6-6-6 6"/>`),
  chevronDown: wrap(`<path d="m6 9 6 6 6-6"/>`),
  arrowRight:  wrap(`<path d="M5 12h14M13 6l6 6-6 6"/>`),
  arrowLeft:   wrap(`<path d="M19 12H5M11 18l-6-6 6-6"/>`),
  close:       wrap(`<path d="M18 6 6 18M6 6l12 12"/>`),
  check:       wrap(`<path d="M20 6 9 17l-5-5"/>`),
  plus:        wrap(`<path d="M12 5v14M5 12h14"/>`),
  minus:       wrap(`<path d="M5 12h14"/>`),
  share:       wrap(`<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4M12 2v13"/>`),
  copy:        wrap(`<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`),
  bookmark:    wrap(`<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>`),
  bookmarkFill:wrap(`<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor" stroke="none"/>`),
  heart:       wrap(`<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`),
  heartFill:   wrap(`<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none"/>`),
  edit:        wrap(`<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>`),
  trash:       wrap(`<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`),
  download:    wrap(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>`),
  upload:      wrap(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>`),
  refresh:     wrap(`<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>`),

  /* ===== Audio ===== */
  play:        wrap(`<path d="m6 3 14 9-14 9V3z" fill="currentColor" stroke="none"/>`),
  pause:       wrap(`<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>`),
  prev:        wrap(`<path d="m18 4-10 8 10 8V4z" fill="currentColor" stroke="none"/><rect x="5" y="4" width="2" height="16" rx="1" fill="currentColor" stroke="none"/>`),
  next:        wrap(`<path d="m6 4 10 8-10 8V4z" fill="currentColor" stroke="none"/><rect x="17" y="4" width="2" height="16" rx="1" fill="currentColor" stroke="none"/>`),
  speaker:     wrap(`<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>`),
  repeat:      wrap(`<path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>`),
  repeatOne:   wrap(`<path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4" fill="none"/>`),
  speed:       wrap(`<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>`),

  /* ===== Quran reader ===== */
  fontSize:    wrap(`<path d="M4 20 9 8l5 12M6 16h6"/><path d="M16 20v-7M14 16h4M14 13h4M16 13V8h2"/>`),
  textSpacing: wrap(`<path d="M4 6h16M4 12h16M4 18h16"/>`),
  tajweed:     wrap(`<path d="M12 2 2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>`),
  waqf:        wrap(`<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 9h6v6H9z"/>`),

  /* ===== Topics (for "More" screen) ===== */
  prayer:      wrap(`<path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 4 7l3 3 3-3c2-2 4-4 4-7a7 7 0 0 0-7-7Z"/><circle cx="12" cy="9" r="2.5"/>`),
  qibla:       wrap(`<circle cx="12" cy="12" r="10"/><path d="m12 6 3 6-3 6-3-6z" fill="currentColor" stroke="none"/>`),
  tasbeeh:     wrap(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5M9.5 9.5l5 5M14.5 9.5l-5 5"/>`),
  adhkar:      wrap(`<path d="M12 2 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6z"/><path d="M9 11l2 2 4-4"/>`),
  dua:         wrap(`<path d="M12 2v4M5 8l3-2M19 8l-3-2M4 16a8 8 0 0 1 16 0v.5a3.5 3.5 0 0 1-7 0v-.5"/><path d="M12 14v6"/>`),
  hadith:      wrap(`<path d="M3 4h14a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H8l-5 4z"/><path d="M7 8h8M7 11h6"/>`),
  seerah:      wrap(`<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>`),
  prophets:    wrap(`<circle cx="12" cy="6" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/><path d="M9 14h6"/>`),
  names:       wrap(`<path d="M12 2 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6z"/><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-family="serif">ٱللَّه</text></svg>`),
  calendar:    wrap(`<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>`),
  ramadan:     wrap(`<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`),
  hajj:        wrap(`<path d="M12 2 2 22h20z"/><path d="M8 22V14a4 4 0 0 1 8 0v8"/>`),
  fasting:     wrap(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`),

  /* ===== Stats / progress ===== */
  award:       wrap(`<circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/>`),
  chart:       wrap(`<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>`),
  list:        wrap(`<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>`),
  alert:       wrap(`<path d="M12 2 2 22h20z"/><path d="M12 9v4M12 17h.01"/>`),
  info:        wrap(`<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>`),
  sparkles:    wrap(`<path d="M12 3v3M12 18v3M5 12H2M22 12h-3M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M9 12l2 2 4-4"/>`),
};
