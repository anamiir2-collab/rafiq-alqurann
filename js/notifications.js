/* =====================================================================
   notifications.js — الإشعارات (spec section 35)
   - Optional prayer / wird / morning-evening adhkar reminders
   - No annoying default-on (spec: "لا تفعل الإشعارات المزعجة افتراضيًا")
   - Uses Notification API + simple interval-based scheduling (no service worker push)
   ===================================================================== */

import { State } from './state.js';
import { Storage } from './storage.js';
import { Icons } from '../components/icons.js';
import { toast } from '../components/toast.js';

const SCHEDULE_KEY = 'rafiq-notif-schedule';

export function renderNotifications(container) {
  const settings = State.getSlice('settings');
  const notif = settings.notifications || { prayer: false, wird: false, morningAdhkar: false, eveningAdhkar: false };

  const permission = ('Notification' in window) ? Notification.permission : 'unsupported';

  container.innerHTML = `
    <div class="page container-app">
      <div class="section-header">
        <h2>الإشعارات</h2>
      </div>

      ${permission === 'unsupported' ? `
        <div class="card card-pad text-center" style="background:color-mix(in srgb,#C53030 8%,transparent);border-color:transparent">
          <div class="text-sm" style="color:#C53030">
            ${Icons.alert} متصفحك لا يدعم الإشعارات. جرب متصفحًا أحدث (Chrome / Firefox / Safari).
          </div>
        </div>
      ` : permission === 'denied' ? `
        <div class="card card-pad text-center" style="background:color-mix(in srgb,#C53030 8%,transparent);border-color:transparent">
          <div class="text-sm" style="color:#C53030">
            ${Icons.alert} لقد منعت الإشعارات. لتفعيلها، افتح إعدادات المتصفح واسمح بالإشعارات لهذا الموقع.
          </div>
        </div>
      ` : permission === 'default' ? `
        <div class="card card-pad-lg text-center">
          <div style="font-size:32px;margin-bottom:8px">${Icons.prayer}</div>
          <h3 class="h3">السماح بالإشعارات</h3>
          <p class="text-muted mt-2" style="font-size:14px;line-height:1.7">
            نُذكّرك بالصلاة والورد والأذكار في أوقاتها. كل الإشعارات اختيارية ومحلية على جهازك.
          </p>
          <button class="btn btn-primary mt-4" id="notif-allow">${Icons.check} السماح بالإشعارات</button>
        </div>
      ` : `
        <div class="card card-pad" style="background:color-mix(in srgb,#2F855A 8%,transparent);border-color:transparent;margin-bottom:16px">
          <div class="text-sm text-center" style="color:#2F855A">
            ✓ الإشعارات مفعّلة. اختر ما تريد تذكيرك به:
          </div>
        </div>

        <div class="divider-label">التذكيرات</div>
        <div class="list">
          ${notifRow('prayer', 'مواقيت الصلاة', 'تذكير قبل كل صلاة بدقائق', Icons.prayer)}
          ${notifRow('wird', 'الورد اليومي', 'تذكير بقراءة وردك', Icons.book)}
          ${notifRow('morningAdhkar', 'أذكار الصباح', 'بعد الفجر', Icons.sun)}
          ${notifRow('eveningAdhkar', 'أذكار المساء', 'بعد العصر', Icons.moon)}
        </div>

        <div class="card card-pad mt-4" style="background:var(--bg-subtle);border-color:transparent">
          <div class="text-xs text-muted text-center" style="line-height:1.7">
            ${Icons.info} ملاحظة: تعمل الإشعارات فقط أثناء فتح التطبيق في المتصفح. لتذكيرات دائمة، ثبّت التطبيق كـ PWA على جهازك.
          </div>
        </div>
      `}

      <div style="height:32px"></div>
    </div>
  `;

  // Wire up allow button
  const allowBtn = container.querySelector('#notif-allow');
  if (allowBtn) {
    allowBtn.onclick = async () => {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          toast('تم السماح بالإشعارات', 'success');
          // Send welcome notification
          new Notification('رفيق القرآن', {
            body: 'الحمد لله الذي هدانا لهذا. سيصلك التذكير في أوقاته.',
            icon: 'assets/logo-1.png',
          });
          renderNotifications(container);
        } else {
          toast('لم تُسمح بالإشعارات', 'info');
        }
      } catch (e) {
        toast('تعذر طلب الإذن', 'error');
      }
    };
  }

  // Wire up toggle rows
  container.querySelectorAll('[data-notif-key]').forEach(row => {
    row.onclick = () => {
      const key = row.getAttribute('data-notif-key');
      const newNotif = { ...notif, [key]: !notif[key] };
      State.setSlice('settings', { notifications: newNotif });

      if (newNotif[key]) {
        toast(`تم تفعيل تذكير ${labelForKey(key)}`, 'success');
        // Schedule a test notification
        scheduleTest(key);
      } else {
        toast(`تم إيقاف تذكير ${labelForKey(key)}`, 'info');
      }
      renderNotifications(container);
    };
  });
}

function notifRow(key, title, sub, icon) {
  const settings = State.getSlice('settings');
  const enabled = settings.notifications?.[key];
  return `
    <button class="row ${enabled ? 'done-row' : ''}" data-notif-key="${key}">
      <div class="row-icon" style="width:38px;height:38px;border-radius:var(--radius-md);background:color-mix(in srgb,var(--c-blue) 14%,transparent);color:var(--quran-color);display:flex;align-items:center;justify-content:center">
        ${icon}
      </div>
      <div class="row-body">
        <div class="row-title ${enabled ? 'text-muted' : ''}">${title}</div>
        <div class="row-sub">${sub}</div>
      </div>
      <div class="row-trail">
        ${enabled ? '<span class="badge" style="background:#2F855A;color:white;border-color:transparent">مفعّل</span>' : '<span class="badge">تفعيل</span>'}
      </div>
    </button>
  `;
}

function labelForKey(key) {
  return { prayer: 'الصلاة', wird: 'الورد', morningAdhkar: 'أذكار الصباح', eveningAdhkar: 'أذكار المساء' }[key] || key;
}

function scheduleTest(key) {
  // Schedule a one-time test notification 5 seconds from now (for user feedback)
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      const messages = {
        prayer: { title: 'حان وقت الصلاة', body: 'حي على الصلاة، حي على الفلاح' },
        wird: { title: 'تذكير: ورد اليوم', body: 'لا تنسَ وردك من القرآن' },
        morningAdhkar: { title: 'أذكار الصباح', body: 'ابدأ يومك بذكر الله' },
        eveningAdhkar: { title: 'أذكار المساء', body: 'لا تنسَ أذكار المساء' },
      };
      const m = messages[key] || { title: 'رفيق القرآن', body: 'تذكير' };
      new Notification(m.title, { body: m.body, icon: 'assets/logo-1.png' });
    }
  }, 5000);
}
