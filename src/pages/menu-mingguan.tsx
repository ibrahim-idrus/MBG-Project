import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { ClientScript } from '../components/ClientScript.js';

const script = String.raw`
(() => {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const money = (v) => new Intl.NumberFormat('id-ID').format(Number(v || 0));
  const api = async (url, opts) => { const r = await fetch(url, opts); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(r.status === 401 ? 'Sesi berakhir.' : Object.values(d.errors || {}).join(' ') || d.message || 'Permintaan gagal.'); return d; };
  const MEAL_ICONS = { breakfast: 'wb_twilight', lunch: 'light_mode', snack: 'bakery_dining' };
  const MEAL_LABELS = { breakfast: 'Sarapan', lunch: 'Makan Siang', snack: 'Snack' };

  let currentDate = new Date();
  currentDate.setHours(0,0,0,0);

  function getMonday(d) {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    dt.setDate(dt.getDate() + diff);
    return dt;
  }

  function fmtDate(d) { return d.toISOString().slice(0, 10); }
  function fmtShort(d) { const m = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']; return d.getDate() + ' ' + m[d.getMonth()]; }

  async function loadWeek() {
    const monday = getMonday(currentDate);
    const dateStr = fmtDate(monday);
    try {
      const result = await api('/api/admin/menus/week?date=' + dateStr);
      const week = result.data;
      document.getElementById('week-range').textContent = fmtShort(monday) + ' - ' + fmtShort(new Date(monday.getTime() + 6*86400000)) + ' ' + monday.getFullYear();
      renderDays(week.days);
    } catch (e) {
      document.getElementById('week-days').innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-8">' + esc(e.message) + '</p>';
    }
  }

  function renderDays(days) {
    const today = fmtDate(new Date());
    let html = '';
    for (const day of days) {
      const isToday = day.date === today;
      const border = isToday ? 'border-primary border-2' : 'border-outline-variant';
      const menus = day.menus || [];
      const breakfast = menus.find(m => m.meal_type === 'breakfast');
      const lunch = menus.find(m => m.meal_type === 'lunch');
      const snack = menus.find(m => m.meal_type === 'snack');
      const totalCal = menus.reduce((s, m) => s + (m.total_calories || 0), 0);
      const totalProt = menus.reduce((s, m) => s + (m.total_protein || 0), 0);
      const totalCarb = menus.reduce((s, m) => s + (m.total_carbohydrates || 0), 0);
      const totalFat = menus.reduce((s, m) => s + (m.total_fat || 0), 0);
      const hasData = menus.length > 0;

      html += '<div class="bg-surface-container-lowest rounded-xl border ' + border + ' p-4 flex flex-col">';
      html += '<div class="flex items-center justify-between mb-3">';
      html += '<h3 class="font-headline-sm text-headline-sm text-on-surface">' + esc(day.dayName) + '</h3>';
      html += '<span class="font-body-sm text-body-sm text-on-surface-variant">' + esc(day.date) + '</span>';
      html += '</div>';

      if (hasData) {
        for (const meal of ['breakfast', 'lunch', 'snack']) {
          const m = meal === 'breakfast' ? breakfast : meal === 'lunch' ? lunch : snack;
          html += '<div class="mb-3">';
          html += '<div class="flex items-center gap-1.5 mb-1">';
          html += '<span class="material-symbols-outlined text-[16px] text-secondary-container">' + MEAL_ICONS[meal] + '</span>';
          html += '<span class="font-label-md text-label-md text-on-surface-variant">' + MEAL_LABELS[meal] + '</span>';
          html += '</div>';
          if (m) {
            html += '<p class="font-body-sm text-body-sm text-on-surface font-medium mb-1">' + esc(m.name) + '</p>';
            html += '<div class="flex flex-wrap gap-1.5">';
            html += '<span class="inline-block px-2 py-0.5 rounded-full bg-surface-container-high text-body-sm text-on-surface">' + m.total_calories + ' kcal</span>';
            html += '<span class="inline-block px-2 py-0.5 rounded-full bg-surface-container-high text-body-sm text-on-surface">' + m.total_protein + 'g P</span>';
            html += '<span class="inline-block px-2 py-0.5 rounded-full bg-surface-container-high text-body-sm text-on-surface">' + m.total_carbohydrates + 'g C</span>';
            html += '<span class="inline-block px-2 py-0.5 rounded-full bg-surface-container-high text-body-sm text-on-surface">' + m.total_fat + 'g F</span>';
            html += '</div>';
          } else {
            html += '<p class="text-on-surface-variant text-body-sm italic">Belum diatur</p>';
          }
          html += '</div>';
        }
        html += '<div class="mt-auto pt-3 border-t border-surface-variant flex items-center justify-between">';
        html += '<span class="font-label-md text-label-md text-on-surface-variant">Total: ' + money(totalCal) + ' kcal</span>';
        html += '<a href="/admin/menu/tambah-hari?date=' + day.date + '" class="text-primary font-label-md text-label-md hover:underline">Edit</a>';
        html += '</div>';
      } else {
        html += '<div class="flex-1 flex flex-col items-center justify-center py-6 text-on-surface-variant">';
        html += '<span class="material-symbols-outlined text-4xl mb-2">restaurant_menu</span>';
        html += '<p class="font-body-sm text-body-sm mb-3">Belum ada menu</p>';
        html += '<a href="/admin/menu/tambah-hari?date=' + day.date + '" class="bg-primary text-on-primary rounded-full px-4 py-1.5 font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Tambah Menu</a>';
        html += '</div>';
      }

      html += '</div>';
    }
    document.getElementById('week-days').innerHTML = html;
  }

  document.getElementById('btn-prev').addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 7); loadWeek(); });
  document.getElementById('btn-next').addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 7); loadWeek(); });
  document.getElementById('btn-today').addEventListener('click', () => { currentDate = new Date(); loadWeek(); });

  loadWeek();
})();
`;

export const MenuMingguanPage: FC = () => (
  <AdminLayout title="Menu & Gizi" activePage="/admin/menu">
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 class="font-display-lg text-display-lg text-on-surface">Weekly Menu Schedule</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1">Kelola jadwal menu mingguan dan pantau nilai gizi.</p>
        </div>
        <div class="flex items-center gap-3">
          <a href="/admin/menu/tambah-mingguan" class="bg-primary text-on-primary rounded-full px-5 py-2 font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">calendar_month</span>Tambah Menu Mingguan
          </a>
          <a href="/admin/menu/tambah-hari" class="border border-primary text-primary rounded-full px-5 py-2 font-label-md text-label-md hover:bg-primary/5 transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">edit</span>Edit per Hari
          </a>
        </div>
      </div>

      <div class="flex items-center justify-between mb-6">
        <button id="btn-prev" type="button" class="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <div class="text-center">
          <h3 id="week-range" class="font-headline-sm text-headline-sm text-on-surface">Memuat...</h3>
          <button id="btn-today" type="button" class="text-primary font-label-md text-label-md hover:underline mt-1">Kembali ke minggu ini</button>
        </div>
        <button id="btn-next" type="button" class="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div id="week-days" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <p class="col-span-full text-center text-on-surface-variant py-8">
          <span class="material-symbols-outlined text-4xl animate-spin block mb-2">progress_activity</span>
          Memuat jadwal...
        </p>
      </div>
    </div>
    <ClientScript>{script}</ClientScript>
  </AdminLayout>
);
