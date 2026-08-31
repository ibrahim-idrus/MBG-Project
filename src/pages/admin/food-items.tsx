import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { Button } from '../../components/Button.js';
import { ClientScript } from '../../components/ClientScript.js';

const script = String.raw`
(() => {
  const form = document.getElementById('food-form');
  const modal = document.getElementById('food-modal');
  const rows = document.getElementById('food-rows');
  const message = document.getElementById('food-message');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const api = async (url, options) => { const response = await fetch(url, options); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(response.status === 401 ? 'Sesi berakhir. Silakan masuk kembali.' : Object.values(data.errors || {}).join(' ') || data.message || 'Permintaan gagal.'); return data; };
  const notify = (text, error = false) => {
    let target = message;
    if (error && !modal.classList.contains('hidden')) {
      target = form.querySelector('[role="alert"]');
      if (!target) { target = document.createElement('div'); target.setAttribute('role', 'alert'); form.prepend(target); }
    }
    target.textContent = text;
    target.className = 'mb-4 rounded-lg px-4 py-3 ' + (error ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed');
    target.hidden = !text;
  };
  const setValue = (name, value) => { form.elements[name].value = value ?? ''; };

  const render = (items) => {
    rows.innerHTML = items.length ? items.map((item) => '<tr class="border-b border-surface-variant hover:bg-surface-container-low"><td class="p-3"><div class="font-semibold">'+esc(item.name)+'</div><div class="text-xs text-on-surface-variant">'+esc(item.default_unit)+'</div></td><td class="p-3 text-right">'+esc(item.calories_per_100g ?? 0)+'</td><td class="p-3 text-right">'+esc(item.protein_per_100g ?? 0)+'</td><td class="p-3 text-right">'+esc(item.carbohydrates_per_100g ?? 0)+'</td><td class="p-3 text-right">'+esc(item.fat_per_100g ?? 0)+'</td><td class="p-3 text-right">'+esc(item.fiber_per_100g ?? 0)+'</td><td class="p-3 text-right"><button type="button" data-edit="'+item.id+'" class="text-primary mr-3">Edit</button><button type="button" data-delete="'+item.id+'" class="text-error">Hapus</button></td></tr>').join('') : '<tr><td colspan="7" class="p-8 text-center text-on-surface-variant">Belum ada bahan makanan.</td></tr>';
  };

  const load = async () => {
    try {
      const search = document.getElementById('food-search').value.trim();
      const params = new URLSearchParams({ per_page: '100' });
      if (search) params.set('search', search);
      const result = await api('/api/admin/food-items?' + params);
      render(result.data);
    } catch (error) { notify(error.message, true); }
  };

  const open = async (id) => {
    form.reset();
    form.querySelector('[role="alert"]')?.remove();
    form.dataset.id = id || '';
    document.getElementById('food-modal-title').textContent = id ? 'Edit Bahan' : 'Tambah Bahan';
    if (id) {
      const item = (await api('/api/admin/food-items/' + id)).data;
      ['name','default_unit','calories_per_100g','protein_per_100g','carbohydrates_per_100g','fat_per_100g','fiber_per_100g'].forEach((key) => setValue(key, item[key]));
    }
    modal.classList.remove('hidden');
  };

  document.getElementById('food-add').addEventListener('click', () => open());
  document.getElementById('food-close').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('food-refresh').addEventListener('click', load);
  document.getElementById('food-search').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); load(); } });

  rows.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    try {
      if (button.dataset.edit) { await open(button.dataset.edit); return; }
      if (button.dataset.delete) {
        if (!confirm('Hapus bahan ini?')) return;
        await api('/api/admin/food-items/' + button.dataset.delete, { method: 'DELETE' });
        notify('Bahan berhasil dihapus.');
        load();
      }
    } catch (error) { notify(error.message, true); }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    ['calories_per_100g','protein_per_100g','carbohydrates_per_100g','fat_per_100g','fiber_per_100g'].forEach((key) => {
      if (payload[key] !== '' && payload[key] !== undefined) payload[key] = Number(payload[key]);
    });
    try {
      const id = form.dataset.id;
      await api(id ? '/api/admin/food-items/' + id : '/api/admin/food-items', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      modal.classList.add('hidden');
      notify(id ? 'Bahan berhasil diperbarui.' : 'Bahan berhasil ditambahkan.');
      load();
    } catch (error) { notify(error.message, true); }
  });

  load();
})();
`;

export const FoodItemsPage: FC = () => (
  <AdminLayout title="Bahan Makanan" activePage="/admin/food-items">
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 class="font-display-lg text-display-lg text-on-surface">Bahan Makanan</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1">Kelola data bahan makanan beserta nilai gizi per 100g.</p>
        </div>
        <Button variant="primary" shape="pill" type="button" onclick="document.getElementById('food-add').click()">
          <span class="material-symbols-outlined text-[18px]">add</span>Tambah Bahan
        </Button>
      </div>
      <div id="food-message" hidden></div>
      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div class="p-card-padding border-b border-surface-variant flex flex-col lg:flex-row gap-3 lg:items-center">
          <input id="food-search" class="flex-1 border border-outline-variant rounded-lg px-3 py-2" placeholder="Cari nama bahan..." aria-label="Cari nama bahan" />
          <Button variant="secondary" shape="rounded" type="button" onclick="document.getElementById('food-refresh').click()">Muat ulang</Button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low">
              <tr>
                <th class="p-3">Nama Bahan</th>
                <th class="p-3 text-right">Kalori</th>
                <th class="p-3 text-right">Protein</th>
                <th class="p-3 text-right">Karbohidrat</th>
                <th class="p-3 text-right">Lemak</th>
                <th class="p-3 text-right">Serat</th>
                <th class="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody id="food-rows"></tbody>
          </table>
        </div>
      </div>

      <button id="food-add" type="button" hidden>add</button>
      <button id="food-refresh" type="button" hidden>refresh</button>

      <div id="food-modal" class="hidden fixed inset-0 z-30 bg-black/30 p-4 overflow-y-auto">
        <div class="bg-surface-card max-w-2xl mx-auto mt-10 rounded-xl p-6">
          <div class="flex justify-between items-center mb-5">
            <h3 id="food-modal-title" class="font-headline-md text-headline-md">Tambah Bahan</h3>
            <button id="food-close" type="button" class="text-2xl" aria-label="Tutup">×</button>
          </div>
          <form id="food-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="md:col-span-2">Nama Bahan<input name="name" required class="mt-1 w-full border border-outline-variant rounded-lg p-2" placeholder="Contoh: Nasi Putih" /></label>
            <label>Unit Default<select name="default_unit" class="mt-1 w-full border border-outline-variant rounded-lg p-2">
              <option value="g">g (gram)</option>
              <option value="ml">ml (milliliter)</option>
              <option value="pcs">pcs (pcs)</option>
              <option value="cup">cup</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
            </select></label>
            <div></div>
            <label>Kalori / 100g<input name="calories_per_100g" type="number" min="0" step="0.01" class="mt-1 w-full border border-outline-variant rounded-lg p-2" placeholder="0" /></label>
            <label>Protein / 100g (g)<input name="protein_per_100g" type="number" min="0" step="0.01" class="mt-1 w-full border border-outline-variant rounded-lg p-2" placeholder="0" /></label>
            <label>Karbohidrat / 100g (g)<input name="carbohydrates_per_100g" type="number" min="0" step="0.01" class="mt-1 w-full border border-outline-variant rounded-lg p-2" placeholder="0" /></label>
            <label>Lemak / 100g (g)<input name="fat_per_100g" type="number" min="0" step="0.01" class="mt-1 w-full border border-outline-variant rounded-lg p-2" placeholder="0" /></label>
            <label>Serat / 100g (g)<input name="fiber_per_100g" type="number" min="0" step="0.01" class="mt-1 w-full border border-outline-variant rounded-lg p-2" placeholder="0" /></label>
            <div class="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onclick="document.getElementById('food-close').click()" class="border border-primary text-primary rounded-lg px-5 py-2 font-label-md text-label-md hover:bg-primary/5 transition-colors">Batal</button>
              <button type="submit" class="bg-primary text-on-primary rounded-lg px-5 py-2 font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <ClientScript>{script}</ClientScript>
  </AdminLayout>
);
