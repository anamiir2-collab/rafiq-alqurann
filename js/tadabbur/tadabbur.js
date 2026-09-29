/* =====================================================================
   tadabbur.js — Tadabbur screen (spec section 52, 53) — Phase P4 placeholder
   ===================================================================== */

import { Icons } from '../../components/icons.js';
import { IDB } from '../storage.js';

export async function renderTadabbur(container) {
  const reflections = await IDB.getAll('reflections');
  reflections.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>التدبر</h2>
        <a href="#/tadabbur/new" class="section-action">+ خاطرة جديدة</a>
      </div>

      <div class="card card-pad-lg text-center" style="padding:32px 24px;margin-bottom:16px;background:linear-gradient(135deg,color-mix(in srgb,var(--c-purple) 16%,var(--card)) 0%,var(--card) 60%);border-color:color-mix(in srgb,var(--c-purple) 30%,transparent)">
        <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:50%;background:color-mix(in srgb,var(--c-purple) 20%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center">
          ${Icons.reflect}
        </div>
        <h3 class="h3">خواطرك الشخصية</h3>
        <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
          اكتب ما شعرت به، ما تعلمته، ما تريد تطبيقه.
          هذه خواطرك أنت — ليست تفسيرًا شرعيًا.
        </p>
      </div>

      ${reflections.length === 0 ? `
        <div class="empty-state" style="padding:48px 16px">
          <div class="empty-state-icon">${Icons.edit}</div>
          <div class="empty-state-title">لا توجد خواطر بعد</div>
          <div class="empty-state-text">ابدأ بكتابة أول خاطرة من أي آية</div>
        </div>
      ` : `
        <div class="list">
          ${reflections.map(r => `
            <a class="row" href="#/tadabbur/${r.id}">
              <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-purple) 16%,transparent);color:var(--reflect-color);display:flex;align-items:center;justify-content:center">
                ${Icons.edit}
              </div>
              <div class="row-body">
                <div class="row-title">${escapeHtml(r.surahName || '')} • آية ${toAr(r.ayah || 0)}</div>
                <div class="row-sub line-clamp-2">${escapeHtml((r.text || '').slice(0, 100))}</div>
              </div>
              <div class="row-trail">${Icons.chevronLeft}</div>
            </a>
          `).join('')}
        </div>
      `}
      <div style="height:32px"></div>
    </div>
  `;
}

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toAr(n) { return String(n).replace(/\d/g, d => AR_DIGITS[+d]); }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
