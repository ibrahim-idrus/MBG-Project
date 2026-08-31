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
  const setValue = (name, value) => { form.elements[name].value = value ?? ''; };
  let kitchens = [];
  let schools = [];
  const kitchenSelect = document.getElementById('menu-kitchen');
  const schoolSelect = document.getElementById('menu-school');
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
    const [kitchenResult, schoolResult] = await Promise.all([api('/api/admin/kitchens?per_page=100'), api('/api/admin/schools?per_page=100')]);
    kitchens = kitchenResult.data; schools = schoolResult.data;
    kitchenSelect.innerHTML = '<option value="">Pilih dapur</option>' + kitchens.map(item => '<option value="'+item.id+'">'+esc(item.name)+' ('+esc(item.code)+')</option>').join('');
    renderSchools();
  };
  const render = (items) => { rows.innerHTML = items.length ? items.map((item) => '<tr class="border-b border-surface-variant hover:bg-surface-container-low"><td class="p-3">'+esc(item.menu_date)+'</td><td class="p-3"><div class="font-semibold">'+esc(item.name)+'</div><div class="text-xs text-on-surface-variant">'+esc(item.kitchen?.name)+' · '+esc(item.school?.name)+'</div></td><td class="p-3">'+esc(item.meal_type)+'</td><td class="p-3 text-right">'+esc(item.calories ?? '-')+' kcal</td><td class="p-3 text-right"><button type="button" data-edit="'+item.id+'" class="text-primary mr-3">Edit</button><button type="button" data-delete="'+item.id+'" class="text-error">Hapus</button></td></tr>').join('') : '<tr><td colspan="5" class="p-8 text-center text-on-surface-variant">Belum ada menu.</td></tr>'; };
  const load = async () => { try { const params = new URLSearchParams({ per_page: '100', sort: document.getElementById('menu-sort').value }); const search = document.getElementById('menu-search').value.trim(); const date = document.getElementById('menu-date-filter').value; const meal = document.getElementById('menu-meal-filter').value; if (search) params.set('search', search); if (date) params.set('date', date); if (meal) params.set('meal_type', meal); const result = await api('/api/admin/menus?'+params); render(result.data); } catch (error) { notify(error.message, true); } };
  const open = async (id) => { form.reset(); form.querySelector('[role="alert"]')?.remove(); form.dataset.id = id || ''; document.getElementById('menu-modal-title').textContent = id ? 'Edit Menu' : 'Tambah Menu'; if (id) { const item = (await api('/api/admin/menus/'+id)).data; ['name','description','composition','photo_url','menu_date','meal_type','calories','protein','carbohydrates','fat','fiber'].forEach((key) => setValue(key, item[key])); setValue('kitchen_id', item.kitchen_id); renderSchools(item.school_id); } else { renderSchools(); } modal.classList.remove('hidden'); };
  document.getElementById('menu-add').addEventListener('click', () => open()); document.getElementById('menu-close').addEventListener('click', () => modal.classList.add('hidden')); document.getElementById('menu-refresh').addEventListener('click', load); ['menu-date-filter','menu-meal-filter','menu-sort'].forEach((id) => document.getElementById(id).addEventListener('change', load)); document.getElementById('menu-search').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); load(); } });
  rows.addEventListener('click', async (event) => { const button = event.target.closest('button'); if (!button) return; try { if (button.dataset.edit) { await open(button.dataset.edit); return; } if (button.dataset.delete && confirm('Hapus menu ini?')) { await api('/api/admin/menus/'+button.dataset.delete, { method: 'DELETE' }); notify('Menu berhasil dihapus.'); load(); } } catch (error) { notify(error.message, true); } });
  form.addEventListener('submit', async (event) => { event.preventDefault(); const payload = Object.fromEntries(new FormData(form).entries()); ['calories','protein','carbohydrates','fat','fiber','kitchen_id','school_id'].forEach((key) => { if (payload[key] !== '') payload[key] = Number(payload[key]); }); try { const id = form.dataset.id; await api(id ? '/api/admin/menus/'+id : '/api/admin/menus', { method: id ? 'PATCH' : 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(payload) }); modal.classList.add('hidden'); notify(id ? 'Menu berhasil diperbarui.' : 'Menu berhasil dibuat.'); load(); } catch (error) { notify(error.message, true); } });
  loadOptions().then(load).catch((error) => notify(error.message, true)); if (new URLSearchParams(location.search).get('new') === '1' || location.pathname.endsWith('/tambah')) open();
})();
`;

export const MenuPage: FC = () => (
  <AdminLayout title="Menu & Gizi" activePage="/admin/menu">
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"><div><h2 class="font-display-lg text-display-lg text-on-surface">Menu & Gizi</h2><p class="font-body-md text-body-md text-on-surface-variant mt-1">Kelola menu, komposisi, dan informasi gizi berdasarkan dapur dan sekolah.</p></div><Button variant="primary" shape="pill" type="button" onclick="document.getElementById('menu-add').click()"><span class="material-symbols-outlined text-[18px]">add</span>Tambah Menu</Button></div>
      <div id="menu-message" hidden></div>
      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden"><div class="p-card-padding border-b border-surface-variant flex flex-col lg:flex-row gap-3 lg:items-center"><input id="menu-search" class="flex-1 border border-outline-variant rounded-lg px-3 py-2" placeholder="Cari nama menu..." aria-label="Cari nama menu" /><input id="menu-date-filter" type="date" class="border border-outline-variant rounded-lg px-3 py-2" aria-label="Filter tanggal" /><select id="menu-meal-filter" class="border border-outline-variant rounded-lg px-3 py-2"><option value="">Semua waktu makan</option><option value="breakfast">Sarapan</option><option value="lunch">Makan siang</option><option value="snack">Snack</option></select><select id="menu-sort" class="border border-outline-variant rounded-lg px-3 py-2"><option value="newest">Terbaru</option><option value="oldest">Terlama</option></select><Button variant="secondary" shape="rounded" type="button" onclick="document.getElementById('menu-refresh').click()">Muat ulang</Button></div><div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-surface-container-low"><tr><th class="p-3">Tanggal</th><th class="p-3">Menu</th><th class="p-3">Waktu</th><th class="p-3 text-right">Kalori</th><th class="p-3 text-right">Aksi</th></tr></thead><tbody id="menu-rows"></tbody></table></div></div>
      <button id="menu-add" type="button" hidden>add</button><button id="menu-refresh" type="button" hidden>refresh</button>
      <div id="menu-modal" class="hidden fixed inset-0 z-30 bg-black/30 p-4 overflow-y-auto"><div class="bg-surface-card max-w-3xl mx-auto mt-10 rounded-xl p-6"><div class="flex justify-between items-center mb-5"><h3 id="menu-modal-title" class="font-headline-md text-headline-md">Tambah Menu</h3><button id="menu-close" type="button" class="text-2xl" aria-label="Tutup">×</button></div><form id="menu-form" class="grid grid-cols-1 md:grid-cols-2 gap-4"><label class="md:col-span-2">Nama Menu<input name="name" required class="mt-1 w-full border border-outline-variant rounded-lg p-2" /></label><label>Dapur<select id="menu-kitchen" name="kitchen_id" required class="mt-1 w-full border border-outline-variant rounded-lg p-2"><option value="">Pilih dapur</option></select></label><label>Sekolah<select id="menu-school" name="school_id" required class="mt-1 w-full border border-outline-variant rounded-lg p-2"><option value="">Pilih sekolah</option></select></label><label>Waktu makan<select name="meal_type" required class="mt-1 w-full border border-outline-variant rounded-lg p-2"><option value="breakfast">Sarapan</option><option value="lunch">Makan siang</option><option value="snack">Snack</option></select></label><label>Tanggal<input name="menu_date" type="date" required class="mt-1 w-full border border-outline-variant rounded-lg p-2" /></label><label class="md:col-span-2">Deskripsi<textarea name="description" class="mt-1 w-full border border-outline-variant rounded-lg p-2"></textarea></label><label class="md:col-span-2">Komposisi<textarea name="composition" class="mt-1 w-full border border-outline-variant rounded-lg p-2"></textarea></label><label>Foto URL<input name="photo_url" class="mt-1 w-full border border-outline-variant rounded-lg p-2" /></label><div></div>{['calories','protein','carbohydrates','fat','fiber'].map((key) => <label>{key === 'carbohydrates' ? 'Karbohidrat' : key}<input name={key} type="number" min="0" step="0.01" class="mt-1 w-full border border-outline-variant rounded-lg p-2" /></label>)}<div class="md:col-span-2 flex justify-end gap-3"><button type="button" onclick="document.getElementById('menu-close').click()" class="border border-primary text-primary rounded-lg px-5 py-2">Batal</button><button type="submit" class="bg-primary text-on-primary rounded-lg px-5 py-2">Simpan Menu</button></div></form></div></div>
    </div>
    <ClientScript>{script}</ClientScript>
  </AdminLayout>
);
