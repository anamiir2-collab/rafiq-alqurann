/* =====================================================================
   favorites.js — المفضلة والمحفوظات (spec section 54)
   Browse items saved to IndexedDB: ayahs (favorites + bookmarks),
   reflections, names of Allah.
   ===================================================================== */

import { IDB } from './storage.js';
import { Icons } from '../components/icons.js';
import { getSurahMeta, getAyahText } from './quran/quran-data.js';
import { loadQuran } from './quran/quran-data.js';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

export async function renderFavorites(container) {
  await loadQuran();

  const [favorites, bookmarks, reflections, names] = await Promise.all([
    IDB.getAll('favorites'),
    IDB.getAll('bookmarks'),
    IDB.getAll('reflections'),
    IDB.getAll('favorites'),  // names are also in favorites with type='name'
  ]);

  // Group favorites by type
  const ayahFavs = favorites.filter(f => f.type === 'ayah');
  const nameFavs = favorites.filter(f => f.type === 'name');
  const reflectionsSorted = reflections.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const totalCount = ayahFavs.length + bookmarks.length + reflectionsSorted.length + nameFavs.length;

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>المحفوظات والمفضلة</h2>
        <span class="text-sm text-muted">${toAr(totalCount)} عنصر</span>
      </div>

      ${totalCount === 0 ? `
        <div class="empty-state" style="padding:64px 16px">
          <div class="empty-state-icon">${Icons.bookmark}</div>
          <div class="empty-state-title">لا توجد عناصر محفوظة</div>
          <div class="empty-state-text">
            اضغط على ❤️ بجانب أي آية لإضافتها للمفضلة<br>
            أو على 🔖 لحفظها في المحفوظات<br>
            أو على ✏️ لكتابة خاطرة
          </div>
        </div>
      ` : ''}

      ${ayahFavs.length > 0 ? `
        <div class="divider-label">الآيات المفضلة (${toAr(ayahFavs.length)})</div>
        <div class="list">
          ${ayahFavs.map(f => {
            const meta = getSurahMeta(f.surah);
            return `
              <a class="row" href="#/quran/${f.surah}">
                <div class="row-icon" style="color:var(--remind-color)">${Icons.heartFill}</div>
                <div class="row-body">
                  <div class="font-quran text-lg line-clamp-2" style="color:var(--fg-strong);line-height:1.8">${escapeHtml(f.text)}</div>
                  <div class="row-sub">${escapeHtml(f.surahName || meta?.name || '')} • آية ${toAr(f.ayah)}</div>
                </div>
                <div class="row-trail">${Icons.chevronLeft}</div>
              </a>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${bookmarks.length > 0 ? `
        <div class="divider-label">المحفوظات (${toAr(bookmarks.length)})</div>
        <div class="list">
          ${bookmarks.map(b => `
            <a class="row" href="#/quran/${b.surah}">
              <div class="row-icon" style="color:var(--quran-color)">${Icons.bookmarkFill}</div>
              <div class="row-body">
                <div class="font-quran text-md line-clamp-2" style="color:var(--fg-strong);line-height:1.8">${escapeHtml(b.text || getAyahText(b.surah, b.ayah) || '')}</div>
                <div class="row-sub">${escapeHtml(b.surahName || '')} • آية ${toAr(b.ayah)}</div>
              </div>
              <div class="row-trail">${Icons.chevronLeft}</div>
            </a>
          `).join('')}
        </div>
      ` : ''}

      ${reflectionsSorted.length > 0 ? `
        <div class="divider-label">الخواطر (${toAr(reflectionsSorted.length)})</div>
        <div class="list">
          ${reflectionsSorted.map(r => `
            <a class="row" href="#/tadabbur/${r.id}">
              <div class="row-icon" style="color:var(--reflect-color)">${Icons.edit}</div>
              <div class="row-body">
                <div class="row-title">${escapeHtml(r.surahName || '')} • آية ${toAr(r.ayah || 0)}</div>
                <div class="row-sub line-clamp-2">${escapeHtml((r.text || '').slice(0, 120))}</div>
              </div>
              <div class="row-trail">${Icons.chevronLeft}</div>
            </a>
          `).join('')}
        </div>
      ` : ''}

      ${nameFavs.length > 0 ? `
        <div class="divider-label">أسماء الله الحسنى المفضلة (${toAr(nameFavs.length)})</div>
        <div class="list">
          ${nameFavs.map(n => `
            <a class="row" href="#/more/names">
              <div class="row-icon font-quran" style="font-size:20px;color:var(--reflect-color);display:flex;align-items:center;justify-content:center">${escapeHtml(n.arabic)}</div>
              <div class="row-body">
                <div class="row-title">${escapeHtml(n.translit)}</div>
              </div>
              <div class="row-trail">${Icons.chevronLeft}</div>
            </a>
          `).join('')}
        </div>
      ` : ''}

      ${totalCount > 0 ? `
        <div class="card card-pad mt-6" style="text-align:center;background:var(--bg-subtle);border-color:transparent">
          <button class="btn btn-danger btn-sm" id="clear-favs">${Icons.trash} حذف الكل</button>
        </div>
      ` : ''}

      <div style="height:32px"></div>
    </div>
  `;

  const clearBtn = container.querySelector('#clear-favs');
  if (clearBtn) {
    clearBtn.onclick = async () => {
      if (!confirm('هل أنت متأكد من حذف جميع العناصر المحفوظة؟ لا يمكن التراجع.')) return;
      await Promise.all([
        IDB.clear('favorites'),
        IDB.clear('bookmarks'),
        IDB.clear('reflections'),
      ]);
      location.reload();
    };
  }
}
