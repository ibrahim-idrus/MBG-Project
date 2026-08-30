import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { StatCard } from '../components/StatCard.js';
import { KelolaDataTile } from '../components/KelolaDataTile.js';
import { fiturAdmin } from '../data/dashboard-mock.js';
import { ClientScript } from '../components/ClientScript.js';

const script = String.raw`
(() => {
  const money = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0));
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const status = { pending: ['Pending', 'bg-yellow-100 text-yellow-800'], in_progress: ['Dalam proses', 'bg-blue-100 text-blue-700'], completed: ['Selesai', 'bg-green-100 text-green-700'], rejected: ['Ditolak', 'bg-red-100 text-red-700'] };
  const api = async (url) => { const response = await fetch(url); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(Object.values(data.errors || {}).join(' ') || data.message || 'Data dashboard tidak dapat dimuat.'); return data; };
  const load = async () => { try { const [finance, aspirations, pending] = await Promise.all([api('/api/admin/finance/statistics?year='+new Date().getFullYear()), api('/api/admin/aspirations?per_page=5&sort=newest'), api('/api/admin/aspirations?status=pending&per_page=1')]); const summary = finance.data.summary; document.getElementById('dashboard-income').textContent = 'Rp'+money(summary.total_income); document.getElementById('dashboard-expense').textContent = 'Rp'+money(summary.total_expenses); document.getElementById('dashboard-balance').textContent = 'Rp'+money(summary.balance); document.getElementById('dashboard-reports').textContent = money(pending.pagination.total); const rows = document.getElementById('dashboard-report-rows'); rows.innerHTML = aspirations.data.length ? aspirations.data.map((item, index) => { const [label, style] = status[item.status] || [item.status, 'bg-surface-container text-on-surface-variant']; return '<tr class="border-b border-surface-variant/50 hover:bg-surface-container-lowest"><td class="py-3 px-4 text-on-surface-variant">'+(index + 1)+'</td><td class="py-3 px-4 whitespace-nowrap">'+esc((item.created_at || '').slice(0, 10))+'</td><td class="py-3 px-4">Publik</td><td class="py-3 px-4 text-on-surface-variant">'+esc(item.category)+'</td><td class="py-3 px-4"><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold '+style+'">'+esc(label)+'</span></td><td class="py-3 px-4 text-center"><a href="/admin/aspirasi" class="text-primary" aria-label="Lihat aspirasi"><span class="material-symbols-outlined text-[20px]">visibility</span></a></td></tr>'; }).join('') : '<tr><td colspan="6" class="py-8 text-center text-on-surface-variant">Belum ada laporan.</td></tr>'; } catch (error) { const message = document.getElementById('dashboard-message'); message.textContent = error.message; message.hidden = false; } };
  load();
})();
`;

export const DashboardPage: FC = () => {
  return (
    <AdminLayout title="Dashboard" activePage="/admin">
      <div class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1">
          <div class="mb-8">
            <h2 class="font-display-lg text-display-lg text-on-surface mb-2">Selamat datang, Admin SPPG!</h2>
            <p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">calendar_today</span>
              Periode Aktif: 18 - 24 Agustus 2026
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="account_balance_wallet" iconColor="text-tertiary-container" iconBg="bg-tertiary-container/10" label="Dana Diterima" value="Memuat..." valueId="dashboard-income" />
            <StatCard icon="outbox" iconColor="text-secondary-container" iconBg="bg-secondary-container/10" label="Total Pengeluaran" value="Memuat..." valueId="dashboard-expense" />
            <StatCard icon="savings" iconColor="text-primary-container" iconBg="bg-primary-container/10" label="Sisa Dana" value="Memuat..." valueId="dashboard-balance" />
            <StatCard icon="report" iconColor="text-error" iconBg="bg-error/10" label="Laporan Baru" value="Memuat..." valueId="dashboard-reports" />
          </div>
          <div id="dashboard-message" hidden class="mb-4 rounded-lg bg-error-container text-on-error-container px-4 py-3"></div>

          <div class="mb-8">
            <h3 class="font-headline-md text-headline-md text-on-surface mb-4">Kelola Data</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KelolaDataTile icon="payments" iconColor="text-tertiary" iconBg="bg-tertiary-container/10" title="Kelola Keuangan" description="Tambah & kelola data pemasukan, pengeluaran, dan dokumen." href="/admin/keuangan" />
              <KelolaDataTile icon="restaurant" iconColor="text-secondary" iconBg="bg-secondary-container/10" title="Kelola Menu & Gizi" description="Tambah & kelola jadwal menu, komposisi, dan informasi gizi." href="/admin/menu" />
              <KelolaDataTile icon="assessment" iconColor="text-blue-600" iconBg="bg-blue-100" title="Kelola Laporan" description="Lihat, proses, dan ubah status laporan dari masyarakat." href="/admin/aspirasi" />
              <KelolaDataTile icon="description" iconColor="text-primary" iconBg="bg-primary-container/10" title="Dokumen" description="Simpan dokumen pendukung program MBG." href="/admin/dokumen" />
            </div>
          </div>

          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <div class="p-card-padding border-b border-surface-variant flex justify-between items-center">
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Laporan Terbaru</h3>
              <a href="/admin/aspirasi" class="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
                Lihat Semua <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-low border-b border-surface-variant">
                    <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4 w-12">No</th>
                    <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Tanggal</th>
                    <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Dapur MBG</th>
                    <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Kategori</th>
                    <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Status</th>
                    <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody id="dashboard-report-rows" class="font-body-md text-body-md text-on-surface"><tr><td colspan={6} class="py-8 text-center text-on-surface-variant">Memuat laporan...</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="lg:w-72 xl:w-80 shrink-0">
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding sticky top-20">
            <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4">Fitur Admin</h3>
            <div class="space-y-4">
              {fiturAdmin.map((fitur) => (
                <a href={fitur.href} class="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors group">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary shrink-0">
                    <span class="material-symbols-outlined text-[18px]">{fitur.icon}</span>
                  </div>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{fitur.title}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{fitur.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ClientScript>{script}</ClientScript>
    </AdminLayout>
  );
};
