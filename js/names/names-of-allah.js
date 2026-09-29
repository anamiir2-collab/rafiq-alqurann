/* =====================================================================
   names-of-allah.js — أسماء الله الحسنى (spec section 38)
   - 99 names from verified dataset (data/names-of-allah/names.json)
   - Each name: arabic + transliteration + short meaning + explanation
   - Favorite (saved to IndexedDB)
   - Search filter
   ===================================================================== */

import { IDB, Storage } from '../storage.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';

let namesCache = null;

async function loadNames() {
  if (namesCache) return namesCache;
  try {
    const res = await fetch('data/names-of-allah/names.json');
    if (!res.ok) throw new Error('Failed to load names');
    namesCache = await res.json();
    return namesCache;
  } catch (e) {
    console.error('Failed to load Names of Allah:', e);
    return [];
  }
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }

export async function renderNames(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>أسماء الله الحسنى</h2>
        <span class="text-sm text-muted">٩٩ اسمًا</span>
      </div>

      <div class="names-hero card card-pad-lg text-center">
        <div class="font-quran" style="font-size:28px;color:var(--fg-strong);line-height:1.6">وَلِلَّهِ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ فَٱدْعُوهُ بِهَا</div>
        <div class="text-xs text-muted mt-2">سورة الأعراف • آية ١٨٠</div>
      </div>

      <div class="surah-index-search" style="position:static;margin:16px 0">
        <div class="search-wrap">
          <input type="search" class="input" id="names-search" placeholder="ابحث عن اسم..." autocomplete="off" />
          <span class="search-icon">${Icons.search}</span>
        </div>
      </div>

      <div id="names-list"></div>
      <div style="height:32px"></div>
    </div>
  `;

  const list = container.querySelector('#names-list');
  const search = container.querySelector('#names-search');
  const names = await loadNames();

  if (names.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding:48px 16px">
        <div class="empty-state-icon">${Icons.alert}</div>
        <div class="empty-state-title">تعذر تحميل الأسماء</div>
      </div>`;
    return;
  }

  function render(filter = '') {
    const f = filter.trim();
    const items = names.filter(n => {
      if (!f) return true;
      return n.arabic.includes(f) ||
             n.translit.toLowerCase().includes(f.toLowerCase()) ||
             n.meaning.includes(f);
    });
    if (items.length === 0) {
      list.innerHTML = `
        <div class="empty-state" style="padding:32px 16px">
          <div class="empty-state-icon">${Icons.search}</div>
          <div class="empty-state-title">لا توجد نتائج</div>
        </div>`;
      return;
    }
    list.innerHTML = items.map(n => `
      <button class="row names-row" data-name="${n.number}">
        <div class="row-icon names-num">${toAr(n.number)}</div>
        <div class="row-body">
          <div class="row-title font-quran" style="font-size:22px;color:var(--fg-strong)">${n.arabic}</div>
          <div class="row-sub">${escapeHtml(n.translit)} • ${escapeHtml(n.meaning)}</div>
        </div>
        <div class="row-trail">${Icons.chevronLeft}</div>
      </button>
    `).join('');

    list.querySelectorAll('.names-row').forEach(row => {
      row.onclick = () => openName(Number(row.getAttribute('data-name')));
    });
  }

  function openName(num) {
    const n = names.find(x => x.number === num);
    if (!n) return;
    import('../components/bottom-sheet.js').then(({ openSheet }) => {
      openSheet({
        title: n.arabic,
        subtitle: `${n.translit} • رقم ${toAr(n.number)}`,
        body: `
          <div class="names-detail">
            <div class="names-detail-meaning">${escapeHtml(n.meaning)}</div>
            <div class="names-detail-explain">${escapeHtml(n.short)}</div>
            <div class="names-detail-quote font-quran">
              ﴿ وَلِلَّهِ ٱلْمَثَلُ ٱلْأَعْلَىٰ ﴾
            </div>
            <div class="text-xs text-muted text-center">سورة النحل • آية ٦٠</div>
          </div>
        `,
        actions: [
          { id: 'fav', label: 'مفضلة', icon: Icons.heart, onClick: async () => {
            const id = `name-${n.number}`;
            const existing = await IDB.get('favorites', id);
            if (existing) {
              await IDB.delete('favorites', id);
              toast('أُزيل من المفضلة', 'info');
            } else {
              await IDB.put('favorites', {
                id, type: 'name', number: n.number,
                arabic: n.arabic, translit: n.translit,
                createdAt: new Date().toISOString(),
              });
              toast('تمت الإضافة للمفضلة', 'success');
            }
          }},
          { id: 'share', label: 'مشاركة', icon: Icons.share, onClick: async () => {
            const text = `${n.arabic}\n${n.translit}\n${n.meaning}\n\n${n.short}`;
            if (navigator.share) {
              try { await navigator.share({ title: n.arabic, text }); } catch {}
            } else {
              await navigator.clipboard.writeText(text);
              toast('تم النسخ', 'success');
            }
          }},
        ],
      });
    });
  }

  render();
  search.addEventListener('input', (e) => render(e.target.value));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
