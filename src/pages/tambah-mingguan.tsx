import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { ClientScript } from '../components/ClientScript.js';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function getMondayOfThisWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const script = String.raw`
(() => {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const api = async (url, opts) => { const r = await fetch(url, opts); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(r.status === 401 ? 'Sesi berakhir.' : Object.values(d.errors || {}).join(' ') || d.message || 'Permintaan gagal.'); return d; };

  let kitchens = [], schools = [], foodItems = [];
  let meals = {};
  const weekDates = JSON.parse(document.getElementById('mg-week-dates').value);

  const kitchenSelect = document.getElementById('mg-kitchen');
  const schoolSelect = document.getElementById('mg-school');
  const message = document.getElementById('mg-message');

  for (const dateStr of weekDates) {
    meals[dateStr] = {
      lunch: { name: '', description: '', photo_url: '', compositions: [] },
    };
  }

  function renderSchools(selected) {
    const match = schools.filter(s => String(s.kitchen_id) === kitchenSelect.value);
    schoolSelect.innerHTML = '<option value="">Pilih sekolah</option>' + match.map(s => '<option value="' + s.id + '">' + esc(s.name) + '</option>').join('');
    if (selected) schoolSelect.value = String(selected);
    schoolSelect.disabled = !kitchenSelect.value || match.length === 0;
  }
  kitchenSelect.addEventListener('change', () => renderSchools());

  function notify(text, error) {
    message.textContent = text;
    message.className = 'mb-4 rounded-lg px-4 py-3 ' + (error ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed');
    message.hidden = !text;
  }

  function renderCompositions(dateStr, mealType) {
    const container = document.getElementById('comp-' + dateStr + '-' + mealType);
    if (!container) return;
    const comps = meals[dateStr][mealType].compositions;
    if (comps.length === 0) {
      container.innerHTML = '<p class="text-on-surface-variant text-sm italic py-2">Belum ada komposisi. Klik "+ Tambah Item".</p>';
      return;
    }
    let html = '<table class="w-full text-left text-sm"><thead class="bg-surface-container-low"><tr>';
    html += '<th class="p-2">Bahan</th><th class="p-2 w-24">Jumlah</th><th class="p-2 w-20">Unit</th>';
    html += '<th class="p-2 w-16 text-right">Kal</th><th class="p-2 w-16 text-right">Prot</th>';
    html += '<th class="p-2 w-16 text-right">Karb</th><th class="p-2 w-16 text-right">Lemak</th>';
    html += '<th class="p-2 w-16 text-right">Serat</th>';
    html += '<th class="p-2 w-10"></th></tr></thead><tbody>';
    for (let i = 0; i < comps.length; i++) {
      const c = comps[i];
      const fi = foodItems.find(f => f.id === c.food_item_id);
      const cal = fi ? fi.calories_per_100g : 0;
      const prot = fi ? fi.protein_per_100g : 0;
      const carb = fi ? fi.carbohydrates_per_100g : 0;
      const fat = fi ? fi.fat_per_100g : 0;
      const fiber = fi ? fi.fiber_per_100g : 0;
      html += '<tr class="border-t border-surface-variant">';
      html += '<td class="p-2"><select class="w-full border border-outline-variant rounded p-1 text-sm comp-food" data-date="' + dateStr + '" data-meal="' + mealType + '" data-idx="' + i + '">';
      html += '<option value="">Pilih bahan</option>';
      for (const f of foodItems) html += '<option value="' + f.id + '"' + (c.food_item_id === f.id ? ' selected' : '') + '>' + esc(f.name) + ' (' + esc(f.default_unit) + ')</option>';
      html += '</select></td>';
      html += '<td class="p-2"><input type="number" min="0.01" step="0.01" class="w-full border border-outline-variant rounded p-1 text-sm comp-amount" data-date="' + dateStr + '" data-meal="' + mealType + '" data-idx="' + i + '" value="' + c.amount + '" /></td>';
      html += '<td class="p-2"><input type="text" class="w-full border border-outline-variant rounded p-1 text-sm comp-unit" data-date="' + dateStr + '" data-meal="' + mealType + '" data-idx="' + i + '" value="' + esc(c.unit) + '" /></td>';
      html += '<td class="p-2 text-right text-xs">' + cal + '</td>';
      html += '<td class="p-2 text-right text-xs">' + prot + '</td>';
      html += '<td class="p-2 text-right text-xs">' + carb + '</td>';
      html += '<td class="p-2 text-right text-xs">' + fat + '</td>';
      html += '<td class="p-2 text-right text-xs">' + fiber + '</td>';
      html += '<td class="p-2 text-center"><button type="button" class="text-error text-sm comp-remove" data-date="' + dateStr + '" data-meal="' + mealType + '" data-idx="' + i + '">✕</button></td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.classList.contains('comp-food')) {
      const d = t.dataset.date, meal = t.dataset.meal, idx = Number(t.dataset.idx);
      meals[d][meal].compositions[idx].food_item_id = Number(t.target.value) || 0;
      const fi = foodItems.find(f => f.id === meals[d][meal].compositions[idx].food_item_id);
      if (fi) meals[d][meal].compositions[idx].unit = fi.default_unit;
      renderCompositions(d, meal);
      updateDaySummary(d);
      updateWeekSummary();
    } else if (t.classList.contains('comp-amount')) {
      const d = t.dataset.date, meal = t.dataset.meal, idx = Number(t.dataset.idx);
      meals[d][meal].compositions[idx].amount = Number(t.target.value) || 0;
      renderCompositions(d, meal);
      updateDaySummary(d);
      updateWeekSummary();
    } else if (t.classList.contains('comp-unit')) {
      const d = t.dataset.date, meal = t.dataset.meal, idx = Number(t.dataset.idx);
      meals[d][meal].compositions[idx].unit = t.target.value;
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.comp-remove');
    if (btn) {
      const d = btn.dataset.date, meal = btn.dataset.meal, idx = Number(btn.dataset.idx);
      meals[d][meal].compositions.splice(idx, 1);
      renderCompositions(d, meal);
      updateDaySummary(d);
      updateWeekSummary();
    }
    const addBtn = e.target.closest('.add-comp');
    if (addBtn) {
      const d = addBtn.dataset.date, meal = addBtn.dataset.meal;
      meals[d][meal].compositions.push({ food_item_id: 0, amount: 0, unit: 'g' });
      renderCompositions(d, meal);
    }
    const collapseBtn = e.target.closest('.day-collapse');
    if (collapseBtn) {
      const panel = collapseBtn.closest('.mg-day-panel');
      const body = panel.querySelector('.day-body');
      const icon = collapseBtn.querySelector('.collapse-icon');
      body.classList.toggle('hidden');
      icon.textContent = body.classList.contains('hidden') ? 'expand_more' : 'expand_less';
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.classList.contains('meal-name')) {
      const d = t.dataset.date;
      meals[d].lunch.name = t.value;
    }
  });

  function calcMeal(dateStr, mealType) {
    let cal = 0, prot = 0, carb = 0, fat = 0, fiber = 0;
    for (const c of meals[dateStr][mealType].compositions) {
      if (c.food_item_id > 0) {
        const fi = foodItems.find(f => f.id === c.food_item_id);
        if (fi) {
          cal += fi.calories_per_100g;
          prot += fi.protein_per_100g;
          carb += fi.carbohydrates_per_100g;
          fat += fi.fat_per_100g;
          fiber += fi.fiber_per_100g;
        }
      }
    }
    return { cal: Math.round(cal * 100) / 100, prot: Math.round(prot * 100) / 100, carb: Math.round(carb * 100) / 100, fat: Math.round(fat * 100) / 100, fiber: Math.round(fiber * 100) / 100 };
  }

  function updateDaySummary(dateStr) {
    const n = calcMeal(dateStr, 'lunch');
    const calEl = document.getElementById('sum-cal-' + dateStr);
    const protEl = document.getElementById('sum-prot-' + dateStr);
    const carbEl = document.getElementById('sum-carb-' + dateStr);
    const fatEl = document.getElementById('sum-fat-' + dateStr);
    const fiberEl = document.getElementById('sum-fiber-' + dateStr);
    if (calEl) calEl.textContent = n.cal + ' kcal';
    if (protEl) protEl.textContent = n.prot + ' g';
    if (carbEl) carbEl.textContent = n.carb + ' g';
    if (fatEl) fatEl.textContent = n.fat + ' g';
    if (fiberEl) fiberEl.textContent = n.fiber + ' g';
  }

  function updateWeekSummary() {
    let totalCal = 0, totalProt = 0, totalCarb = 0, totalFat = 0, totalFiber = 0, menuCount = 0;
    for (const dateStr of weekDates) {
      const n = calcMeal(dateStr, 'lunch');
      if (n.cal > 0 || meals[dateStr].lunch.compositions.length > 0) menuCount++;
      totalCal += n.cal;
      totalProt += n.prot;
      totalCarb += n.carb;
      totalFat += n.fat;
      totalFiber += n.fiber;
    }
    document.getElementById('week-total-cal').textContent = Math.round(totalCal) + ' kcal';
    document.getElementById('week-total-prot').textContent = Math.round(totalProt) + ' g';
    document.getElementById('week-total-carb').textContent = Math.round(totalCarb) + ' g';
    document.getElementById('week-total-fat').textContent = Math.round(totalFat) + ' g';
    document.getElementById('week-total-fiber').textContent = Math.round(totalFiber) + ' g';
    document.getElementById('week-menu-count').textContent = menuCount + ' menu';
  }

  function switchDay(dateStr) {
    document.querySelectorAll('.mg-day-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById('day-' + dateStr);
    if (panel) panel.classList.remove('hidden');
    document.querySelectorAll('.mg-day-tab').forEach(t => {
      if (t.dataset.date === dateStr) {
        t.classList.replace('border-outline-variant', 'border-primary');
        t.classList.add('bg-primary/5');
      } else {
        t.classList.replace('border-primary', 'border-outline-variant');
        t.classList.remove('bg-primary/5');
      }
    });
  }

  document.getElementById('mg-day-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.mg-day-tab');
    if (tab) switchDay(tab.dataset.date);
  });

  document.getElementById('mg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    notify('', false);
    if (!kitchenSelect.value) { notify('Dapur wajib dipilih.', true); return; }
    if (!schoolSelect.value) { notify('Sekolah wajib dipilih.', true); return; }

    const kitchenId = Number(kitchenSelect.value);
    const schoolId = Number(schoolSelect.value);
    const payloads = [];

    for (const dateStr of weekDates) {
      const m = meals[dateStr].lunch;
      const validComps = m.compositions.filter(c => c.food_item_id > 0 && c.amount > 0);
      if (!m.name.trim() && validComps.length === 0) continue;
      payloads.push({
        name: m.name.trim() || ('Makan Siang - ' + dateStr),
        kitchen_id: kitchenId,
        school_id: schoolId,
        meal_type: 'lunch',
        menu_date: dateStr,
        description: m.description || null,
        photo_url: m.photo_url || null,
        compositions: validComps,
      });
    }

    if (payloads.length === 0) { notify('Isi minimal satu menu dengan nama atau komposisi.', true); return; }

    const btn = document.getElementById('mg-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Menyimpan...';

    let success = 0, fail = 0;
    try {
      for (const p of payloads) {
        try {
          await api('/api/admin/menus', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(p) });
          success++;
        } catch (_) { fail++; }
      }
      if (fail === 0) {
        notify(success + ' menu berhasil disimpan.');
        setTimeout(() => { window.location.href = '/admin/menu'; }, 800);
      } else {
        notify(success + ' menu berhasil, ' + fail + ' gagal.', true);
      }
    } catch (err) { notify(err.message, true); }

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">save</span>Simpan Semua Menu';
  });

  async function loadExisting() {
    try {
      const [kRes, sRes, fRes] = await Promise.all([
        api('/api/admin/kitchens?per_page=100'),
        api('/api/admin/schools?per_page=100'),
        api('/api/admin/food-items/all'),
      ]);
      kitchens = kRes.data;
      schools = sRes.data;
      foodItems = fRes.data;
      kitchenSelect.innerHTML = '<option value="">Pilih dapur</option>' + kitchens.map(k => '<option value="' + k.id + '">' + esc(k.name) + ' (' + esc(k.code) + ')</option>').join('');
      renderSchools();

      for (const dateStr of weekDates) {
        renderCompositions(dateStr, 'lunch');
        updateDaySummary(dateStr);
      }
      updateWeekSummary();

      const startDate = weekDates[0];
      try {
        const existing = await api('/api/admin/menus/week?date=' + startDate);
        if (existing.data && existing.data.days) {
          for (const day of existing.data.days) {
            if (!day.menus || !meals[day.date]) continue;
            for (const item of day.menus) {
              if (item.meal_type === 'lunch') {
                meals[day.date].lunch.name = item.name;
                meals[day.date].lunch.description = item.description || '';
                meals[day.date].lunch.photo_url = item.photo_url || '';
                if (item.kitchen_id && !kitchenSelect.value) kitchenSelect.value = String(item.kitchen_id);
                if (item.school_id && !schoolSelect.value) { renderSchools(item.school_id); }
              }
            }
          }
          for (const dateStr of weekDates) {
            const nameInput = document.getElementById('name-' + dateStr);
            if (nameInput) nameInput.value = meals[dateStr].lunch.name;
            renderCompositions(dateStr, 'lunch');
            updateDaySummary(dateStr);
          }
          updateWeekSummary();
        }
      } catch (_) {}
    } catch (err) { notify(err.message, true); }
  }

  const today = new Date().toISOString().slice(0, 10);
  switchDay(today);
  loadExisting();
})();
`;

export const TambahMingguanPage: FC = () => {
  const monday = getMondayOfThisWeek();
  const weekDates: string[] = [];
  const weekDays: Array<{ date: string; dayName: string; dateNum: string; isToday: boolean }> = [];
  const todayStr = fmtDate(new Date());

  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    const dateStr = fmtDate(dd);
    weekDates.push(dateStr);
    weekDays.push({
      date: dateStr,
      dayName: DAY_NAMES[dd.getDay()],
      dateNum: String(dd.getDate()).padStart(2, '0'),
      isToday: dateStr === todayStr,
    });
  }

  return (
    <AdminLayout title="Menu & Gizi" activePage="/admin/menu">
      <div class="max-w-6xl mx-auto">
        <div class="mb-6">
          <a href="/admin/menu" class="flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors w-fit">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>Kembali ke Jadwal Mingguan
          </a>
        </div>

        <input type="hidden" id="mg-week-dates" value={JSON.stringify(weekDates)} />

        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-6 mb-6">
          <h3 class="font-headline-sm text-headline-sm mb-6 border-b border-surface-variant pb-2">Informasi Dasar</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-2">Dapur MBG</label>
              <select id="mg-kitchen" required class="w-full border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                <option value="">Pilih dapur</option>
              </select>
            </div>
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-2">Sekolah</label>
              <select id="mg-school" required class="w-full border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                <option value="">Pilih sekolah</option>
              </select>
            </div>
          </div>
          <div id="mg-message" hidden class="mt-4 rounded-lg px-4 py-3"></div>
        </div>

        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-6 mb-6">
          <h3 class="font-headline-sm text-headline-sm mb-4 border-b border-surface-variant pb-2">Pilih Hari</h3>
          <div id="mg-day-tabs" class="flex gap-2 overflow-x-auto pb-2">
            {weekDays.map((day) => (
              <button
                type="button"
                data-date={day.date}
                class={`mg-day-tab border rounded-lg px-3 py-2 text-center transition-colors cursor-pointer min-w-[70px] ${day.isToday ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container'}`}
              >
                <p class="font-label-md text-label-md text-on-surface">{day.dayName.slice(0, 3)}</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant">{day.dateNum}</p>
              </button>
            ))}
          </div>
        </div>

        <form id="mg-form">
          {weekDays.map((day) => (
            <div id={`day-${day.date}`} class={`mg-day-panel bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-6 mb-6 ${day.isToday ? '' : 'hidden'}`}>
              <div class="day-collapse flex items-center justify-between mb-4 border-b border-surface-variant pb-2 cursor-pointer">
                <h3 class="font-headline-sm text-headline-sm">{day.dayName}, {day.date}</h3>
                <span class="material-symbols-outlined collapse-icon text-on-surface-variant">expand_less</span>
              </div>
              <div class="day-body">
                <div class="bg-surface-container-low rounded-lg p-4 mb-4 border border-surface-variant">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="material-symbols-outlined text-secondary">light_mode</span>
                    <h4 class="font-label-lg text-label-lg">Makan Siang</h4>
                  </div>
                  <div class="mb-3">
                    <label class="block font-label-md text-label-md text-on-surface-variant mb-1">Nama Menu</label>
                    <input
                      id={`name-${day.date}`}
                      type="text"
                      placeholder="Contoh: Nasi Goreng Spesial"
                      class="w-full border border-outline-variant rounded p-2 text-body-sm focus:border-primary outline-none meal-name"
                      data-date={day.date}
                      data-meal="lunch"
                    />
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="font-label-md text-label-md text-on-surface-variant">Komposisi & Gizi</label>
                    <button type="button" class="add-comp text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors flex items-center gap-1" data-date={day.date} data-meal="lunch">
                      <span class="material-symbols-outlined text-[16px]">add</span>Tambah Item
                    </button>
                  </div>
                  <div id={`comp-${day.date}-lunch`} class="border border-outline-variant rounded-lg overflow-hidden mb-3"></div>
                  <div class="grid grid-cols-5 gap-3 text-center">
                    <div class="bg-surface-container rounded-lg p-2">
                      <p class="font-label-sm text-label-sm text-on-surface-variant">Kalori</p>
                      <p id={`sum-cal-${day.date}`} class="font-body-sm text-body-sm text-primary font-medium">0 kcal</p>
                    </div>
                    <div class="bg-surface-container rounded-lg p-2">
                      <p class="font-label-sm text-label-sm text-on-surface-variant">Protein</p>
                      <p id={`sum-prot-${day.date}`} class="font-body-sm text-body-sm text-secondary font-medium">0 g</p>
                    </div>
                    <div class="bg-surface-container rounded-lg p-2">
                      <p class="font-label-sm text-label-sm text-on-surface-variant">Karbohidrat</p>
                      <p id={`sum-carb-${day.date}`} class="font-body-sm text-body-sm text-on-surface font-medium">0 g</p>
                    </div>
                    <div class="bg-surface-container rounded-lg p-2">
                      <p class="font-label-sm text-label-sm text-on-surface-variant">Lemak</p>
                      <p id={`sum-fat-${day.date}`} class="font-body-sm text-body-sm text-tertiary font-medium">0 g</p>
                    </div>
                    <div class="bg-surface-container rounded-lg p-2">
                      <p class="font-label-sm text-label-sm text-on-surface-variant">Serat</p>
                      <p id={`sum-fiber-${day.date}`} class="font-body-sm text-body-sm text-on-surface font-medium">0 g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-6 mb-6">
            <h3 class="font-headline-sm text-headline-sm mb-4 border-b border-surface-variant pb-2">Ringkasan Mingguan</h3>
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div class="bg-surface-container rounded-lg p-3 text-center">
                <p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Menu</p>
                <p id="week-menu-count" class="font-headline-sm text-headline-sm text-on-surface">0 menu</p>
              </div>
              <div class="bg-surface-container rounded-lg p-3 text-center">
                <p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Kalori</p>
                <p id="week-total-cal" class="font-headline-sm text-headline-sm text-primary">0 kcal</p>
              </div>
              <div class="bg-surface-container rounded-lg p-3 text-center">
                <p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Protein</p>
                <p id="week-total-prot" class="font-headline-sm text-headline-sm text-secondary">0 g</p>
              </div>
              <div class="bg-surface-container rounded-lg p-3 text-center">
                <p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Karbohidrat</p>
                <p id="week-total-carb" class="font-headline-sm text-headline-sm text-on-surface">0 g</p>
              </div>
              <div class="bg-surface-container rounded-lg p-3 text-center">
                <p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Lemak</p>
                <p id="week-total-fat" class="font-headline-sm text-headline-sm text-tertiary">0 g</p>
              </div>
              <div class="bg-surface-container rounded-lg p-3 text-center">
                <p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Serat</p>
                <p id="week-total-fiber" class="font-headline-sm text-headline-sm text-on-surface">0 g</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <a href="/admin/menu" class="px-6 py-2 rounded border border-primary text-primary font-label-md text-label-md hover:bg-surface-container transition-colors">Batal</a>
            <button id="mg-submit" type="submit" class="px-6 py-2 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">save</span>Simpan Semua Menu
            </button>
          </div>
        </form>
      </div>
      <ClientScript>{script}</ClientScript>
    </AdminLayout>
  );
};
