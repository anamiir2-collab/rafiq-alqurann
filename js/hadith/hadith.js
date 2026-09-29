/* =====================================================================
   hadith.js — الأحاديث (spec section 39)
   - Authentic hadiths from established collections (40 Nawawi subset)
   - Each hadith: text + narrator + source + grade + topic
   - IMPORTANT (spec section 60, 78): No AI-generated hadith. All entries
     are well-known authentic narrations with verified source references.
   - Disclaimer: Users should always verify hadith text against primary
     sources (Bukhari, Muslim, etc.) — see Sources page.
   ===================================================================== */

import { IDB } from '../storage.js';
import { Icons } from '../../components/icons.js';
import { toast } from '../../components/toast.js';

let hadithCache = null;
async function loadHadith() {
  if (hadithCache) return hadithCache;
  try {
    const res = await fetch('data/hadith/hadith.json');
    if (!res.ok) throw new Error('Failed to load hadith');
    hadithCache = await res.json();
    return hadithCache;
  } catch (e) { console.error(e); return []; }
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

export async function renderHadith(container) {
  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الأحاديث</h2>
      </div>

      <div class="card card-pad-lg text-center" style="background:linear-gradient(135deg,color-mix(in srgb,var(--c-blue) 14%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-blue) 30%,transparent);margin-bottom:16px">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-blue) 18%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
          ${Icons.hadith}
        </div>
        <h3 class="h3">من الأحاديث الصحيحة</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
          من الأربعين النووية والكتب الستة
        </p>
      </div>

      <div class="card card-pad" style="background:color-mix(in srgb,var(--c-blue) 8%,transparent);border-color:transparent;margin-bottom:16px">
        <div class="text-xs text-muted text-center" style="line-height:1.7">
          ${Icons.info} للأمان العلمي: يُرجى التحقق من نص الحديث من المصدر الأصلي قبل نقله.
          الأرقام المذكورة هي مراجع للرجوع إلى المصادر الأساسية.
        </div>
      </div>

      <div id="hadith-content">
        <div class="empty-state" style="padding:48px 16px">
          <div class="skeleton" style="width:60%;height:24px;margin:0 auto 12px"></div>
          <div class="skeleton" style="width:40%;height:14px;margin:0 auto"></div>
        </div>
      </div>

      <div style="height:32px"></div>
    </div>
  `;

  const hadiths = await loadHadith();
  const content = container.querySelector('#hadith-content');

  if (hadiths.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${Icons.alert}</div>
        <div class="empty-state-title">تعذر تحميل الأحاديث</div>
      </div>`;
    return;
  }

  content.innerHTML = hadiths.map(h => `
    <div class="card card-pad" style="margin-bottom:12px">
      <div class="font-quran text-lg" style="line-height:1.9;color:var(--fg-strong);margin-bottom:12px">${escapeHtml(h.text)}</div>
      <div class="text-xs text-muted" style="margin-bottom:4px">
        <span class="font-semi">الراوي:</span> ${escapeHtml(h.narrator)}
      </div>
      <div class="text-xs text-muted" style="margin-bottom:4px">
        <span class="font-semi">المصدر:</span> ${escapeHtml(h.source)}
      </div>
      <div class="text-xs" style="color:var(--quran-color);margin-bottom:4px">
        <span class="font-semi">الدرجة:</span> ${escapeHtml(h.grade)}
      </div>
      <div class="text-xs text-muted" style="margin-bottom:12px">
        <span class="font-semi">الموضوع:</span> ${escapeHtml(h.topic)}
      </div>
      <div class="ayah-actions">
        <button class="ayah-action-btn" data-act="copy" data-id="${h.id}" aria-label="نسخ">${Icons.copy}</button>
        <button class="ayah-action-btn" data-act="share" data-id="${h.id}" aria-label="مشاركة">${Icons.share}</button>
        <button class="ayah-action-btn" data-act="fav" data-id="${h.id}" aria-label="مفضلة">${Icons.heart}</button>
      </div>
    </div>
  `).join('');

  content.querySelectorAll('[data-act]').forEach(btn => {
    btn.onclick = async () => {
      const act = btn.getAttribute('data-act');
      const id = Number(btn.getAttribute('data-id'));
      const h = hadiths.find(x => x.id === id);
      if (!h) return;

      if (act === 'copy') {
        try {
          await navigator.clipboard.writeText(`${h.text}\n\n— ${h.narrator}\n${h.source}\nالدرجة: ${h.grade}`);
          toast('تم النسخ', 'success');
        } catch { toast('تعذر النسخ', 'error'); }
      } else if (act === 'share') {
        const text = `${h.text}\n\n— ${h.narrator}\n${h.source}`;
        if (navigator.share) {
          try { await navigator.share({ title: 'حديث', text }); } catch {}
        } else {
          try { await navigator.clipboard.writeText(text); toast('تم النسخ للمشاركة', 'success'); } catch {}
        }
      } else if (act === 'fav') {
        const favId = `hadith-${h.id}`;
        const existing = await IDB.get('favorites', favId);
        if (existing) {
          await IDB.delete('favorites', favId);
          btn.classList.remove('active');
          toast('أُزيل من المفضلة', 'info');
        } else {
          await IDB.put('favorites', {
            id: favId, type: 'hadith', hadithId: h.id, text: h.text,
            source: h.source, narrator: h.narrator,
            createdAt: new Date().toISOString(),
          });
          btn.classList.add('active');
          toast('تمت الإضافة للمفضلة', 'success');
        }
      }
    };

    if (btn.getAttribute('data-act') === 'fav') {
      const id = Number(btn.getAttribute('data-id'));
      IDB.get('favorites', `hadith-${id}`).then(f => { if (f) btn.classList.add('active'); });
    }
  });
}
