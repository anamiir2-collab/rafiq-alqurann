/* =====================================================================
   duas.js — الأدعية (spec section 37)
   - Categories: قرآنية / أنبياء / صباح ومساء / كرب / استخارة / والدين / سفر
   - Each dua: text + source + virtue (optional) + copy + share + favorite
   ===================================================================== */

import { IDB } from '../storage.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';

let duasCache = null;
async function loadDuas() {
  if (duasCache) return duasCache;
  try {
    const res = await fetch('data/duas/duas.json');
    if (!res.ok) throw new Error('Failed to load duas');
    duasCache = await res.json();
    return duasCache;
  } catch (e) { console.error(e); return []; }
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

export async function renderDuas(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الأدعية</h2>
      </div>
      <div id="duas-content">
        <div class="empty-state" style="padding:48px 16px">
          <div class="skeleton" style="width:60%;height:24px;margin:0 auto 12px"></div>
          <div class="skeleton" style="width:40%;height:14px;margin:0 auto"></div>
        </div>
      </div>
      <div style="height:32px"></div>
    </div>
  `;

  const duas = await loadDuas();
  const content = container.querySelector('#duas-content');

  if (duas.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${Icons.alert}</div>
        <div class="empty-state-title">تعذر تحميل الأدعية</div>
      </div>`;
    return;
  }

  // Group by category
  const byCat = new Map();
  for (const d of duas) {
    if (!byCat.has(d.category)) byCat.set(d.category, { label: d.categoryAr, items: [] });
    byCat.get(d.category).items.push(d);
  }

  let html = `
    <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-pink) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-pink) 30%,transparent);margin-bottom:16px">
      <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-pink) 18%,transparent);color:var(--remind-color);display:flex;align-items:center;justify-content:center">
        ${Icons.dua}
      </div>
      <h3 class="h3">أدعية موثوقة</h3>
      <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
        من القرآن الكريم والسنة النبوية الصحيحة
      </p>
    </div>
  `;

  for (const [catKey, { label, items }] of byCat) {
    html += `
      <div class="divider-label">${escapeHtml(label)} (${toAr(items.length)})</div>
      <div class="list">
        ${items.map(d => `
          <div class="row" style="cursor:default;align-items:flex-start">
            <div class="row-body" style="flex:1">
              <div class="font-quran text-lg" style="line-height:1.9;color:var(--fg-strong);margin-bottom:8px">${escapeHtml(d.text)}</div>
              ${d.virtue ? `<div class="text-xs text-remind" style="margin-bottom:6px;color:var(--remind-color)">${escapeHtml(d.virtue)}</div>` : ''}
              <div class="text-xs text-muted">${escapeHtml(d.source)}</div>
              <div class="ayah-actions mt-2">
                <button class="ayah-action-btn" data-act="copy" data-id="${d.id}" aria-label="نسخ">${Icons.copy}</button>
                <button class="ayah-action-btn" data-act="share" data-id="${d.id}" aria-label="مشاركة">${Icons.share}</button>
                <button class="ayah-action-btn" data-act="fav" data-id="${d.id}" aria-label="مفضلة">${Icons.heart}</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  content.innerHTML = html;

  // Wire up actions
  content.querySelectorAll('[data-act]').forEach(btn => {
    btn.onclick = async () => {
      const act = btn.getAttribute('data-act');
      const id = btn.getAttribute('data-id');
      const dua = duas.find(d => d.id === id);
      if (!dua) return;

      if (act === 'copy') {
        try {
          await navigator.clipboard.writeText(`${dua.text}\n\n— ${dua.source}`);
          toast('تم النسخ', 'success');
        } catch { toast('تعذر النسخ', 'error'); }
      } else if (act === 'share') {
        const text = `${dua.text}\n\n— ${dua.source}`;
        if (navigator.share) {
          try { await navigator.share({ title: 'دعاء', text }); } catch {}
        } else {
          try { await navigator.clipboard.writeText(text); toast('تم النسخ للمشاركة', 'success'); } catch { toast('تعذر المشاركة', 'error'); }
        }
      } else if (act === 'fav') {
        const favId = `dua-${dua.id}`;
        const existing = await IDB.get('favorites', favId);
        if (existing) {
          await IDB.delete('favorites', favId);
          btn.classList.remove('active');
          toast('أُزيل من المفضلة', 'info');
        } else {
          await IDB.put('favorites', {
            id: favId, type: 'dua', duaId: dua.id, text: dua.text,
            source: dua.source, createdAt: new Date().toISOString(),
          });
          btn.classList.add('active');
          toast('تمت الإضافة للمفضلة', 'success');
        }
      }
    };

    // Mark active if already favorite
    if (btn.getAttribute('data-act') === 'fav') {
      const id = btn.getAttribute('data-id');
      IDB.get('favorites', `dua-${id}`).then(f => { if (f) btn.classList.add('active'); });
    }
  });
}
