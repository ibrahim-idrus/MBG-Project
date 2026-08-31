import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { Button } from '../components/Button.js';
import { ClientScript } from '../components/ClientScript.js';

const script = String.raw`
(() => {
  const form = document.getElementById('menu-form');
  const modal = document.getElementById('menu-modal');
  const rows = document.getElementById('menu-rows');
  const message = document.getElementById('menu-message');
  const detailModal = document.getElementById('menu-detail-modal');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const api = async (url, options) => { const response = await fetch(url, options); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(response.status === 401 ? 'Sesi berakhir. Silakan masuk kembali.' : Object.values(data.errors || {}).join(' ') || data.message || 'Permintaan gagal.'); return data; };
  const notify = (text, error = false) => {
    let target = message;
    if (error && !modal.classList.contains('hidden')) {
      target = form.querySelector('[role="alert"]');
      if (!target) { target = document.createElement('div'); target.setAttribute('role', 'alert'); form.prepend(target); }
    }
    target.textContent = text;
    target.className = 'md:col-span-2 mb-4 rounded-lg px-4 py-3 ' + (error ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed');
    target.hidden = !text;
  };
  const setValue = (name, value) => { if (form.elements[name]) form.elements[name].value = value ?? ''; };
  const MEAL_LABELS = { breakfast: 'Sarapan', lunch: 'Makan Siang', snack: 'Snack' };

  let kitchens = [];
  let schools = [];
  let foodItems = [];
  let compositions = [];

  const kitchenSelect = document.getElementById('menu-kitchen');
  const schoolSelect = document.getElementById('menu-school');
  const compContainer = document.getElementById('compositions-container');

  const setup = document.createElement('div');
  setup.className = 'md:col-span-2 rounded-lg bg-surface-container-low p-4 text-sm';
  setup.hidden = true;
  form.prepend(setup);

  const renderSchools = (selected = '') => {
    const matching = schools.filter(item => String(item.kitchen_id) === kitchenSelect.value);
    schoolSelect.innerHTML = '<option value="">Pilih sekolah</option>' + matching.map(item => '<option value="'+item.id+'">'+esc(item.name)+'</option>').join('');
    schoolSelect.value = String(selected);
    schoolSelect.disabled = !kitchenSelect.value || matching.length === 0;
    const missing = kitchens.length === 0 ? 'Data referensi dapur BGN belum tersedia.' : schools.length === 0 ? 'Data referensi sekolah BGN belum tersedia.' : kitchenSelect.value && matching.length === 0 ? 'Dapur ini belum memiliki sekolah pada data referensi BGN.' : '';
    setup.hidden = !missing;
    setup.innerHTML = esc(missing)+' <a href="/admin/lokasi" class="text-primary underline font-semibold">Lihat dapur dan sekolah</a>';
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = Boolean(missing);
    submit.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
  };
  kitchenSelect.addEventListener('change', () => renderSchools());

  const loadOptions = async () => {
    const [kitchenResult, schoolResult, foodResult] = await Promise.all([
      api('/api/admin/kitchens?per_page=100'),
      api('/api/admin/schools?per_page=100'),
      api('/api/admin/food-items/all'),
    ]);
    kitchens = kitchenResult.data;
    schools = schoolResult.data;
    foodItems = foodResult.data;
    kitchenSelect.innerHTML = '<option value="">Pilih dapur</option>' + kitchens.map(item => '<option value="'+item.id+'">'+esc(item.name)+' ('+esc(item.code)+')</option>').join('');
    renderSchools();
  };

  const renderCompositions = () => {
    if (compositions.length === 0) {
      compContainer.innerHTML = '<p class="text-on-surface-variant text-sm italic">Belum ada komposisi. Klik "Tambah Item" untuk menambahkan.</p>';
      return;
    }
    let html = '<table class="w-full text-left text-sm"><thead class="bg-surface-container-low"><tr><th class="p-2">Bahan</th><th class="p-2 w-24">Jumlah</th><th class="p-2 w-20">Unit</th><th class="p-2 w-20">Kal</th><th class="p-2 w-20">Prot</th><th class="p-2 w-20">Karb</th><th class="p-2 w-20">Lemak</th><th class="p-2 w-10"></th></tr></thead><tbody>';
    for (let i = 0; i < compositions.length; i++) {
      const c = compositions[i];
      const fi = foodItems.find(f => f.id === c.food_item_id);
      const ratio = c.amount / 100;
      const cal = fi ? Math.round(fi.calories_per_100g * ratio * 100) / 100 : 0;
      const prot = fi ? Math.round(fi.protein_per_100g * ratio * 100) / 100 : 0;
      const carb = fi ? Math.round(fi.carbohydrates_per_100g * ratio * 100) / 100 : 0;
      const fat = fi ? Math.round(fi.fat_per_100g * ratio * 100) / 100 : 0;
      html += '<tr class="border-t border-surface-variant">';
      html += '<td class="p-2"><select class="w-full border border-outline-variant rounded p-1 text-sm comp-food" data-idx="'+i+'">';
      html += '<option value="">Pilih bahan</option>';
      for (const f of foodItems) {
        html += '<option value="'+f.id+'"'+(c.food_item_id===f.id?' selected':'')+'>'+esc(f.name)+' ('+esc(f.default_unit)+')</option>';
      }
      html += '</select></td>';
      html += '<td class="p-2"><input type="number" min="0.01" step="0.01" class="w-full border border-outline-variant rounded p-1 text-sm comp-amount" data-idx="'+i+'" value="'+c.amount+'" /></td>';
      html += '<td class="p-2"><input type="text" class="w-full border border-outline-variant rounded p-1 text-sm comp-unit" data-idx="'+i+'" value="'+esc(c.unit)+'" /></td>';
      html += '<td class="p-2 text-right text-xs">'+cal+'</td>';
      html += '<td class="p-2 text-right text-xs">'+prot+'</td>';
      html += '<td class="p-2 text-right text-xs">'+carb+'</td>';
      html += '<td class="p-2 text-right text-xs">'+fat+'</td>';
      html += '<td class="p-2 text-center"><button type="button" class="text-error text-sm comp-remove" data-idx="'+i+'">✕</button></td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    compContainer.innerHTML = html;
  };

  compContainer.addEventListener('change', (e) => {
    const idx = Number(e.target.dataset.idx);
    if (isNaN(idx)) return;
    if (e.target.classList.contains('comp-food')) {
      compositions[idx].food_item_id = Number(e.target.value) || 0;
      const fi = foodItems.find(f => f.id === compositions[idx].food_item_id);
      if (fi) compositions[idx].unit = fi.default_unit;
    } else if (e.target.classList.contains('comp-amount')) {
      compositions[idx].amount = Number(e.target.value) || 0;
    } else if (e.target.classList.contains('comp-unit')) {
      compositions[idx].unit = e.target.value;
    }
    renderCompositions();
  });

  compContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.comp-remove');
    if (!btn) return;
    compositions.splice(Number(btn.dataset.idx), 1);
    renderCompositions();
  });

  document.getElementById('add-composition').addEventListener('click', () => {
    compositions.push({ food_item_id: 0, amount: 0, unit: 'g' });
    renderCompositions();
  });

  const render = (items) => {
    rows.innerHTML = items.length ? items.map((item) => '<tr class="border-b border-surface-variant hover:bg-surface-container-low"><td class="p-3">'+esc(item.menu_date)+'</td><td class="p-3"><div class="font-semibold">'+esc(item.name)+'</div><div class="text-xs text-on-surface-variant">'+esc(item.kitchen?.name)+' · '+esc(item.school?.name)+'</div></td><td class="p-3">'+esc(MEAL_LABELS[item.meal_type]||item.meal_type)+'</td><td class="p-3 text-right"><button type="button" data-detail="'+item.id+'" class="text-primary mr-2">Detail</button><button type="button" data-edit="'+item.id+'" class="text-primary mr-2">Edit</button><button type="button" data-delete="'+item.id+'" class="text-error">Hapus</button></td></tr>').join('') : '<tr><td colspan="4" class="p-8 text-center text-on-surface-variant">Belum ada menu.</td></tr>';
  };

  const load = async () => {
    try {
      const params = new URLSearchParams({ per_page: '100', sort: document.getElementById('menu-sort').value });
      const search = document.getElementById('menu-search').value.trim();
      const date = document.getElementById('menu-date-filter').value;
      const meal = document.getElementById('menu-meal-filter').value;
      if (search) params.set('search', search);
      if (date) params.set('date', date);
      if (meal) params.set('meal_type', meal);
      const result = await api('/api/admin/menus?' + params);
      render(result.data);
    } catch (error) { notify(error.message, true); }
  };

  const open = async (id) => {
    form.reset();
    form.querySelector('[role="alert"]')?.remove();
    form.dataset.id = id || '';
    compositions = [];
    document.getElementById('menu-modal-title').textContent = id ? 'Edit Menu' : 'Tambah Menu';
    if (id) {
      const item = (await api('/api/admin/menus/' + id)).data;
      ['name','description','photo_url','menu_date','meal_type'].forEach((key) => setValue(key, item[key]));
      setValue('kitchen_id', item.kitchen_id);
      renderSchools(item.school_id);
      if (item.compositions && item.compositions.length > 0) {
        compositions = item.compositions.map(c => ({ food_item_id: c.food_item_id || c.id, amount: c.amount, unit: c.unit }));
      }
    } else {
      renderSchools();
    }
    renderCompositions();
    modal.classList.remove('hidden');
  };

  const openDetail = async (id) => {
    const item = (await api('/api/admin/menus/' + id)).data;
    const mealLabel = MEAL_LABELS[item.meal_type] || item.meal_type;
    const comps = item.compositions || [];
    const nutrition = item.nutrition || {};
    let html = '';
    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">';
    if (item.photo_url) {
      html += '<div class="rounded-xl overflow-hidden bg-surface-container-low aspect-video"><img alt="Foto '+esc(item.name)+'" class="object-cover w-full h-full" src="'+esc(item.photo_url)+'" onerror="this.parentElement.innerHTML=\'<div class=\\'flex items-center justify-center h-full text-on-surface-variant\\'><span class=material-symbols-outlined text-4xl>restaurant</span></div>\'" /></div>';
    } else {
      html += '<div class="rounded-xl overflow-hidden bg-surface-container-low aspect-video flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-4xl">restaurant</span></div>';
    }
    html += '<div>';
    html += '<h3 class="font-headline-md text-headline-md text-on-background mb-3">'+esc(item.name)+'</h3>';
    html += '<div class="space-y-2 text-sm">';
    html += '<p><span class="font-semibold">Dapur:</span> '+esc(item.kitchen?.name||'-')+'</p>';
    html += '<p><span class="font-semibold">Sekolah:</span> '+esc(item.school?.name||'-')+'</p>';
    html += '<p><span class="font-semibold">Tanggal:</span> '+esc(item.menu_date)+'</p>';
    html += '<p><span class="font-semibold">Jenis:</span> '+esc(mealLabel)+'</p>';
    if (item.description) html += '<p><span class="font-semibold">Deskripsi:</span> '+esc(item.description)+'</p>';
    html += '</div></div></div>';

    if (comps.length > 0) {
      html += '<h4 class="font-headline-sm text-headline-sm text-on-background mb-3">Komposisi & Gizi</h4>';
      html += '<div class="bg-surface-container-low rounded-xl border border-surface-variant overflow-hidden mb-6">';
      html += '<div class="grid grid-cols-2 bg-surface-container-high"><div class="px-4 py-2 font-label-md text-label-md text-on-surface-variant border-r border-surface-variant">Komposisi</div><div class="px-4 py-2 font-label-md text-label-md text-on-surface-variant">Gizi</div></div>';
      for (let i = 0; i < comps.length; i++) {
        const c = comps[i];
        const border = i < comps.length - 1 ? 'border-b border-surface-variant' : '';
        html += '<div class="grid grid-cols-2 '+border+'">';
        html += '<div class="px-4 py-3 border-r border-surface-variant"><p class="font-body-md text-body-md text-on-surface font-medium">'+esc(c.food_item_name)+'</p><p class="font-body-sm text-body-sm text-on-surface-variant">'+c.amount+' '+esc(c.unit)+'</p></div>';
        html += '<div class="px-4 py-3">';
        html += '<p class="font-body-sm text-body-sm text-on-surface">Protein <span class="font-semibold">'+c.protein+'g</span></p>';
        html += '<p class="font-body-sm text-body-sm text-on-surface">Karbohidrat <span class="font-semibold">'+c.carbohydrates+'g</span></p>';
        html += '<p class="font-body-sm text-body-sm text-on-surface">Lemak <span class="font-semibold">'+c.fat+'g</span></p>';
        html += '</div></div>';
      }
      html += '</div>';
    }

    html += '<h4 class="font-headline-sm text-headline-sm text-on-background mb-3">Total Gizi</h4>';
    html += '<div class="grid grid-cols-2 md:grid-cols-5 gap-3">';
    [{l:'Kalori',v:nutrition.total_calories,u:'kcal'},{l:'Protein',v:nutrition.total_protein,u:'g'},{l:'Karbohidrat',v:nutrition.total_carbohydrates,u:'g'},{l:'Lemak',v:nutrition.total_fat,u:'g'},{l:'Serat',v:nutrition.total_fiber,u:'g'}].forEach(n => {
      html += '<div class="border border-surface-variant rounded-lg p-3 text-center bg-surface"><p class="font-label-md text-label-md text-on-surface-variant mb-1">'+n.l+'</p><p class="font-display-lg text-display-lg text-on-background font-bold">'+(n.v||0)+'</p><p class="font-body-sm text-body-sm text-outline">'+n.u+'</p></div>';
    });
    html += '</div>';

    document.getElementById('detail-content').innerHTML = html;
    detailModal.classList.remove('hidden');
  };

  document.getElementById('menu-add').addEventListener('click', () => open());
  document.getElementById('menu-close').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('detail-close').addEventListener('click', () => detailModal.classList.add('hidden'));
  document.getElementById('menu-refresh').addEventListener('click', load);
  ['menu-date-filter','menu-meal-filter','menu-sort'].forEach((id) => document.getElementById(id).addEventListener('change', load));
  document.getElementById('menu-search').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); load(); } });

  rows.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    try {
      if (button.dataset.detail) { await openDetail(button.dataset.detail); return; }
      if (button.dataset.edit) { await open(button.dataset.edit); return; }
      if (button.dataset.delete && confirm('Hapus menu ini?')) {
        await api('/api/admin/menus/' + button.dataset.delete, { method: 'DELETE' });
        notify('Menu berhasil dihapus.');
        load();
      }
    } catch (error) { notify(error.message, true); }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    ['kitchen_id','school_id'].forEach((key) => { if (payload[key] !== '') payload[key] = Number(payload[key]); });
    payload.compositions = compositions.filter(c => c.food_item_id > 0 && c.amount > 0);
    if (payload.compositions.length === 0) {
      notify('Menu harus memiliki minimal satu komposisi dengan jumlah lebih dari 0.', true);
      return;
    }
    try {
      const id = form.dataset.id;
      await api(id ? '/api/admin/menus/' + id : '/api/admin/menus', {
        method: id ? 'PATCH' : 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify(payload),
      });
      modal.classList.add('hidden');
      notify(id ? 'Menu berhasil diperbarui.' : 'Menu berhasil dibuat.');
      load();
    } catch (error) { notify(error.message, true); }
  });

  loadOptions().then(load).catch((error) => notify(error.message, true));
  if (new URLSearchParams(location.search).get('new') === '1' || location.pathname.endsWith('/tambah')) open();
})();
`;

export const MenuPage: FC = () => (
  <AdminLayout title="Menu & Gizi" activePage="/admin/menu">
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 class="font-display-lg text-display-lg text-on-surface">Menu & Gizi</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1">Kelola menu, komposisi, dan informasi gizi berdasarkan dapur dan sekolah.</p>
        </div>
        <Button variant="primary" shape="pill" type="button" onclick="document.getElementById('menu-add').click()">
          <span class="material-symbols-outlined text-[18px]">add</span>Tambah Menu
        </Button>
      </div>
      <div id="menu-message" hidden></div>
      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div class="p-card-padding border-b border-surface-variant flex flex-col lg:flex-row gap-3 lg:items-center">
          <input id="menu-search" class="flex-1 border border-outline-variant rounded-lg px-3 py-2" placeholder="Cari nama menu..." aria-label="Cari nama menu" />
          <input id="menu-date-filter" type="date" class="border border-outline-variant rounded-lg px-3 py-2" aria-label="Filter tanggal" />
          <select id="menu-meal-filter" class="border border-outline-variant rounded-lg px-3 py-2">
            <option value="">Semua waktu makan</option>
            <option value="breakfast">Sarapan</option>
            <option value="lunch">Makan siang</option>
            <option value="snack">Snack</option>
          </select>
          <select id="menu-sort" class="border border-outline-variant rounded-lg px-3 py-2">
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
          <Button variant="secondary" shape="rounded" type="button" onclick="document.getElementById('menu-refresh').click()">Muat ulang</Button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low">
              <tr>
                <th class="p-3">Tanggal</th>
                <th class="p-3">Menu</th>
                <th class="p-3">Waktu</th>
                <th class="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody id="menu-rows"></tbody>
          </table>
        </div>
      </div>

      <button id="menu-add" type="button" hidden>add</button>
      <button id="menu-refresh" type="button" hidden>refresh</button>

      <div id="menu-modal" class="hidden fixed inset-0 z-30 bg-black/30 p-4 overflow-y-auto">
        <div class="bg-surface-card max-w-3xl mx-auto mt-10 rounded-xl p-6">
          <div class="flex justify-between items-center mb-5">
            <h3 id="menu-modal-title" class="font-headline-md text-headline-md">Tambah Menu</h3>
            <button id="menu-close" type="button" class="text-2xl" aria-label="Tutup">×</button>
          </div>
          <form id="menu-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="md:col-span-2">Nama Menu<input name="name" required class="mt-1 w-full border border-outline-variant rounded-lg p-2" /></label>
            <label>Dapur<select id="menu-kitchen" name="kitchen_id" required class="mt-1 w-full border border-outline-variant rounded-lg p-2"><option value="">Pilih dapur</option></select></label>
            <label>Sekolah<select id="menu-school" name="school_id" required class="mt-1 w-full border border-outline-variant rounded-lg p-2"><option value="">Pilih sekolah</option></select></label>
            <label>Waktu makan<select name="meal_type" required class="mt-1 w-full border border-outline-variant rounded-lg p-2"><option value="breakfast">Sarapan</option><option value="lunch">Makan siang</option><option value="snack">Snack</option></select></label>
            <label>Tanggal<input name="menu_date" type="date" required class="mt-1 w-full border border-outline-variant rounded-lg p-2" /></label>
            <label class="md:col-span-2">Deskripsi<textarea name="description" class="mt-1 w-full border border-outline-variant rounded-lg p-2"></textarea></label>
            <label class="md:col-span-2">Foto URL<input name="photo_url" class="mt-1 w-full border border-outline-variant rounded-lg p-2" placeholder="https://..." /></label>

            <div class="md:col-span-2">
              <div class="flex items-center justify-between mb-2">
                <label class="font-label-md text-label-md text-on-surface">Komposisi & Gizi</label>
                <button type="button" id="add-composition" class="text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">add</span>Tambah Item
                </button>
              </div>
              <div id="compositions-container" class="border border-outline-variant rounded-lg overflow-hidden"></div>
            </div>

            <div class="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onclick="document.getElementById('menu-close').click()" class="border border-primary text-primary rounded-lg px-5 py-2 font-label-md text-label-md hover:bg-primary/5 transition-colors">Batal</button>
              <button type="submit" class="bg-primary text-on-primary rounded-lg px-5 py-2 font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">Simpan Menu</button>
            </div>
          </form>
        </div>
      </div>

      <div id="menu-detail-modal" class="hidden fixed inset-0 z-30 bg-black/30 p-4 overflow-y-auto">
        <div class="bg-surface-card max-w-3xl mx-auto mt-10 rounded-xl p-6">
          <div class="flex justify-between items-center mb-5">
            <h3 class="font-headline-md text-headline-md">Detail Menu</h3>
            <button id="detail-close" type="button" class="text-2xl" aria-label="Tutup">×</button>
          </div>
          <div id="detail-content"></div>
        </div>
      </div>
    </div>
    <ClientScript>{script}</ClientScript>
  </AdminLayout>
);
