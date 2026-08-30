import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { ClientScript } from '../components/ClientScript.js';

const script = String.raw`
(() => {
  const kitchenRows = document.getElementById('kitchen-rows');
  const schoolRows = document.getElementById('school-rows');
  const message = document.getElementById('location-message');
  const esc = (value) => String(value ?? '').replace(/[&<>\\\"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;',"'":'&#039;'}[char]));
  const api = async (url) => { const response = await fetch(url); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Data referensi tidak dapat dimuat.'); return data; };
  const load = async () => {
    try {
      const [kitchens, schools] = await Promise.all([api('/api/admin/kitchens?per_page=100'), api('/api/admin/schools?per_page=100')]);
      document.getElementById('kitchen-count').textContent = kitchens.pagination.total;
      document.getElementById('school-count').textContent = schools.pagination.total;
      kitchenRows.innerHTML = kitchens.data.length ? kitchens.data.map((item) => '<tr class="border-b border-surface-variant"><td class="p-3"><strong>'+esc(item.name)+'</strong><div class="text-xs text-on-surface-variant">'+esc(item.code)+'</div></td><td class="p-3">'+esc(item.city)+'</td><td class="p-3">'+esc(item.capacity)+'</td><td class="p-3">'+esc(item.status)+'</td></tr>').join('') : '<tr><td colspan="4" class="p-6 text-center text-on-surface-variant">Belum ada data dapur.</td></tr>';
      schoolRows.innerHTML = schools.data.length ? schools.data.map((item) => '<tr class="border-b border-surface-variant"><td class="p-3"><strong>'+esc(item.name)+'</strong><div class="text-xs text-on-surface-variant">'+esc(item.npsn)+'</div></td><td class="p-3">'+esc(item.kitchen?.name)+'</td><td class="p-3">'+esc(item.city)+'</td><td class="p-3">'+esc(item.student_count)+'</td></tr>').join('') : '<tr><td colspan="4" class="p-6 text-center text-on-surface-variant">Belum ada data sekolah.</td></tr>';
    } catch (error) { message.textContent = error.message; message.hidden = false; }
  };
  load();
})();
`;

export const AdminLokasiPage: FC = () => (
  <AdminLayout title="Dapur & Sekolah" activePage="/admin/lokasi">
    <div>
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"><div><h2 class="font-display-lg text-display-lg text-on-surface">Dapur & Sekolah</h2><p class="font-body-md text-body-md text-on-surface-variant mt-1">Data referensi program MBG dari BGN. Data ini hanya untuk dibaca dan dipakai sebagai pilihan pada menu serta transaksi.</p></div><span class="inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-2 text-xs text-on-tertiary-fixed-variant"><span class="material-symbols-outlined text-sm">sync</span>Dummy BGN MBG API</span></div>
      <div id="location-message" hidden class="mb-4 rounded-lg bg-error-container text-on-error-container px-4 py-3"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"><div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm"><p class="text-on-surface-variant">Dapur terdaftar</p><p id="kitchen-count" class="font-display-lg text-display-lg text-primary mt-1">-</p></div><div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-sm"><p class="text-on-surface-variant">Sekolah terhubung</p><p id="school-count" class="font-display-lg text-display-lg text-primary mt-1">-</p></div></div>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6"><section class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"><div class="p-card-padding border-b border-surface-variant"><h3 class="font-headline-md text-headline-md">Daftar Dapur</h3><p class="text-xs text-on-surface-variant mt-1">Referensi lokasi layanan MBG</p></div><div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-surface-container-low"><tr><th class="p-3">Dapur</th><th class="p-3">Kota</th><th class="p-3">Kapasitas</th><th class="p-3">Status</th></tr></thead><tbody id="kitchen-rows"></tbody></table></div></section><section class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"><div class="p-card-padding border-b border-surface-variant"><h3 class="font-headline-md text-headline-md">Daftar Sekolah</h3><p class="text-xs text-on-surface-variant mt-1">Sekolah yang dilayani oleh dapur MBG</p></div><div class="overflow-x-auto"><table class="w-full text-left"><thead class="bg-surface-container-low"><tr><th class="p-3">Sekolah</th><th class="p-3">Dapur</th><th class="p-3">Kota</th><th class="p-3">Siswa</th></tr></thead><tbody id="school-rows"></tbody></table></div></section></div>
    </div><ClientScript>{script}</ClientScript>
  </AdminLayout>
);
