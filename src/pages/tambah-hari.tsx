import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { ClientScript } from '../components/ClientScript.js';

const script = String.raw`
(() => {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const api = async (url, opts) => { const r = await fetch(url, opts); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(r.status === 401 ? 'Sesi berakhir.' : Object.values(d.errors || {}).join(' ') || d.message || 'Permintaan gagal.'); return d; };
  const MEAL_LABEL = 'Makan Siang';
  const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  let kitchens = [], schools = [], foodItems = [];
  let meals = {
    lunch: { name: '', description: '', photo_url: '', compositions: [] },
  };

  const dateInput = document.getElementById('tambah-date');
  const daySelect = document.getElementById('tambah-day');
  const kitchenSelect = document.getElementById('tambah-kitchen');
  const schoolSelect = document.getElementById('tambah-school');
  const message = document.getElementById('tambah-message');

  function updateDay() {
    const d = new Date(dateInput.value + 'T00:00:00');
    if (!isNaN(d.getTime())) daySelect.value = d.getDay();
  }
  dateInput.addEventListener('change', updateDay);

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

  function renderCompositions(mealType) {
    const container = document.getElementById('comp-' + mealType);
    const comps = meals[mealType].compositions;
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
      html += '<td class="p-2"><select class="w-full border border-outline-variant rounded p-1 text-sm comp-food" data-meal="' + mealType + '" data-idx="' + i + '">';
      html += '<option value="">Pilih bahan</option>';
      for (const f of foodItems) html += '<option value="' + f.id + '"' + (c.food_item_id === f.id ? ' selected' : '') + '>' + esc(f.name) + ' (' + esc(f.default_unit) + ')</option>';
      html += '</select></td>';
      html += '<td class="p-2"><input type="number" min="0.01" step="0.01" class="w-full border border-outline-variant rounded p-1 text-sm comp-amount" data-meal="' + mealType + '" data-idx="' + i + '" value="' + c.amount + '" /></td>';
      html += '<td class="p-2"><input type="text" class="w-full border border-outline-variant rounded p-1 text-sm comp-unit" data-meal="' + mealType + '" data-idx="' + i + '" value="' + esc(c.unit) + '" /></td>';
      html += '<td class="p-2 text-right text-xs">' + cal + '</td>';
      html += '<td class="p-2 text-right text-xs">' + prot + '</td>';
      html += '<td class="p-2 text-right text-xs">' + carb + '</td>';
      html += '<td class="p-2 text-right text-xs">' + fat + '</td>';
      html += '<td class="p-2 text-right text-xs">' + fiber + '</td>';
      html += '<td class="p-2 text-center"><button type="button" class="text-error text-sm comp-remove" data-meal="' + mealType + '" data-idx="' + i + '">✕</button></td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.classList.contains('comp-food')) {
      const meal = t.dataset.meal, idx = Number(t.dataset.idx);
      meals[meal].compositions[idx].food_item_id = Number(t.target.value) || 0;
      const fi = foodItems.find(f => f.id === meals[meal].compositions[idx].food_item_id);
      if (fi) meals[meal].compositions[idx].unit = fi.default_unit;
      renderCompositions(meal);
      updateSummary();
    } else if (t.classList.contains('comp-amount')) {
      const meal = t.dataset.meal, idx = Number(t.dataset.idx);
      meals[meal].compositions[idx].amount = Number(t.target.value) || 0;
      renderCompositions(meal);
      updateSummary();
    } else if (t.classList.contains('comp-unit')) {
      const meal = t.dataset.meal, idx = Number(t.dataset.idx);
      meals[meal].compositions[idx].unit = t.target.value;
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.comp-remove');
    if (btn) {
      const meal = btn.dataset.meal, idx = Number(btn.dataset.idx);
      meals[meal].compositions.splice(idx, 1);
      renderCompositions(meal);
      updateSummary();
    }
    const addBtn = e.target.closest('.add-comp');
    if (addBtn) {
      const meal = addBtn.dataset.meal;
      meals[meal].compositions.push({ food_item_id: 0, amount: 0, unit: 'g' });
      renderCompositions(meal);
    }
  });

  function calcMeal(mealType) {
    let cal = 0, prot = 0, carb = 0, fat = 0, fiber = 0;
    for (const c of meals[mealType].compositions) {
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

  function updateSummary() {
    const n = calcMeal('lunch');
    document.getElementById('sum-cal').textContent = n.cal + ' kcal';
    document.getElementById('sum-prot').textContent = n.prot + ' g';
    document.getElementById('sum-carb').textContent = n.carb + ' g';
    document.getElementById('sum-fat').textContent = n.fat + ' g';
    document.getElementById('sum-fiber').textContent = n.fiber + ' g';
  }

  window.__setMealName = function(meal, value) { meals[meal].name = value; };

  document.getElementById('tambah-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    notify('', false);
    if (!dateInput.value) { notify('Tanggal wajib diisi.', true); return; }
    if (!kitchenSelect.value) { notify('Dapur wajib dipilih.', true); return; }
    if (!schoolSelect.value) { notify('Sekolah wajib dipilih.', true); return; }

    const kitchenId = Number(kitchenSelect.value);
    const schoolId = Number(schoolSelect.value);
    const menuDate = dateInput.value;
    const m = meals.lunch;
    const validComps = m.compositions.filter(c => c.food_item_id > 0 && c.amount > 0);
    if (!m.name.trim() && validComps.length === 0) { notify('Isi minimal nama menu atau komposisi.', true); return; }
    const payloads = [{
      name: m.name.trim() || (MEAL_LABEL + ' - ' + menuDate),
      kitchen_id: kitchenId,
      school_id: schoolId,
      meal_type: 'lunch',
      menu_date: menuDate,
      description: m.description || null,
      photo_url: m.photo_url || null,
      compositions: validComps,
    }];
    try {
      for (const p of payloads) {
        await api('/api/admin/menus', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(p) });
      }
      notify('Menu berhasil disimpan.');
      setTimeout(() => { window.location.href = '/admin/menu'; }, 800);
    } catch (err) { notify(err.message, true); }
  });

  async function loadExisting() {
    const urlDate = new URLSearchParams(location.search).get('date');
    if (urlDate) dateInput.value = urlDate;
    updateDay();
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
      renderCompositions('lunch');
      updateSummary();

      if (dateInput.value) {
        try {
          const existing = await api('/api/admin/menus?date=' + dateInput.value + '&per_page=100');
          if (existing.data && existing.data.length > 0) {
            for (const item of existing.data) {
              if (item.meal_type === 'lunch') {
                meals.lunch.name = item.name;
                meals.lunch.description = item.description || '';
                meals.lunch.photo_url = item.photo_url || '';
                if (item.kitchen_id) kitchenSelect.value = String(item.kitchen_id);
                if (item.school_id) { renderSchools(item.school_id); }
              }
            }
            document.getElementById('name-lunch').value = meals.lunch.name;
          }
        } catch (_) {}
      }
    } catch (err) { notify(err.message, true); }
  }

  loadExisting();
})();
`;

export const TambahHariPage: FC = () => (
  <AdminLayout title="Menu & Gizi" activePage="/admin/menu">
    <div class="max-w-5xl mx-auto">
      <div class="mb-6">
        <a href="/admin/menu" class="flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors w-fit">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>Kembali ke Jadwal Mingguan
        </a>
      </div>

      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-6">
        <h3 class="font-headline-sm text-headline-sm mb-6 border-b border-surface-variant pb-2">Informasi Dasar</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-2">Tanggal</label>
            <input id="tambah-date" type="date" required class="w-full border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
          </div>
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-2">Hari</label>
            <select id="tambah-day" class="w-full border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" disabled>
              {DAY_NAMES.map((name, i) => <option value={i}>{name}</option>)}
            </select>
          </div>
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-2">Dapur MBG</label>
            <select id="tambah-kitchen" required class="w-full border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
              <option value="">Pilih dapur</option>
            </select>
          </div>
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-2">Sekolah</label>
            <select id="tambah-school" required class="w-full border border-outline-variant rounded-lg p-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
              <option value="">Pilih sekolah</option>
            </select>
          </div>
        </div>

        <div id="tambah-message" hidden class="mb-4 rounded-lg px-4 py-3"></div>

        <h3 class="font-headline-sm text-headline-sm mb-6 border-b border-surface-variant pb-2">Detail Menu</h3>

        <div class="bg-surface-container-low rounded-lg p-4 mb-6 border border-surface-variant">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-secondary">light_mode</span>
            <h4 class="font-headline-sm text-headline-sm">Makan Siang</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block font-label-md text-label-md text-on-surface-variant mb-1">Nama Menu</label>
              <input id="name-lunch" type="text" placeholder="Contoh: Nasi Goreng Spesial"
                class="w-full border border-outline-variant rounded p-2 text-body-sm focus:border-primary outline-none"
                oninput="window.__setMealName('lunch', this.value)" />
            </div>
            <div class="hidden md:block"></div>
          </div>

          <div class="flex items-center justify-between mb-2">
            <label class="font-label-md text-label-md text-on-surface-variant">Komposisi & Gizi</label>
            <button type="button" class="add-comp text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors flex items-center gap-1" data-meal="lunch">
              <span class="material-symbols-outlined text-[16px]">add</span>Tambah Item
            </button>
          </div>
          <div id="comp-lunch" class="border border-outline-variant rounded-lg overflow-hidden mb-3"></div>

          <div class="grid grid-cols-5 gap-3 text-center">
            <div class="bg-surface-container rounded-lg p-2">
              <p class="font-label-md text-label-md text-on-surface-variant">Kalori</p>
              <p id="sum-cal" class="font-headline-sm text-headline-sm text-primary">0 kcal</p>
            </div>
            <div class="bg-surface-container rounded-lg p-2">
              <p class="font-label-md text-label-md text-on-surface-variant">Protein</p>
              <p id="sum-prot" class="font-headline-sm text-headline-sm text-secondary">0 g</p>
            </div>
            <div class="bg-surface-container rounded-lg p-2">
              <p class="font-label-md text-label-md text-on-surface-variant">Karbohidrat</p>
              <p id="sum-carb" class="font-headline-sm text-headline-sm text-on-surface">0 g</p>
            </div>
            <div class="bg-surface-container rounded-lg p-2">
              <p class="font-label-md text-label-md text-on-surface-variant">Lemak</p>
              <p id="sum-fat" class="font-headline-sm text-headline-sm text-tertiary">0 g</p>
            </div>
            <div class="bg-surface-container rounded-lg p-2">
              <p class="font-label-md text-label-md text-on-surface-variant">Serat</p>
              <p id="sum-fiber" class="font-headline-sm text-headline-sm text-on-surface">0 g</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4">
          <a href="/admin/menu" class="px-6 py-2 rounded border border-primary text-primary font-label-md text-label-md hover:bg-surface-container transition-colors">Batal</a>
          <button type="submit" form="tambah-form" class="px-6 py-2 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm">Simpan Menu</button>
        </div>
      </div>
    </div>
    <ClientScript>{script}</ClientScript>
  </AdminLayout>
);

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
