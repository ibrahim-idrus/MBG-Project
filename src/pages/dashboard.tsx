import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { StatCard } from '../components/StatCard.js';
import { KelolaDataTile } from '../components/KelolaDataTile.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { getDashboardStats, getRecentAspirations } from '../db/queries.js';
import { fiturAdmin } from '../data/dashboard-mock.js';
import { formatCurrency } from '../utils/format.js';

export const DashboardPage: FC = () => {
  const stats = getDashboardStats();
  const recentAspirations = getRecentAspirations(5);

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
            <StatCard icon="account_balance_wallet" iconColor="text-tertiary-container" iconBg="bg-tertiary-container/10" label="Dana Diterima" value={formatCurrency(stats.danaDiterima)} />
            <StatCard icon="outbox" iconColor="text-secondary-container" iconBg="bg-secondary-container/10" label="Total Pengeluaran" value={formatCurrency(stats.totalPengeluaran)} />
            <StatCard icon="savings" iconColor="text-primary-container" iconBg="bg-primary-container/10" label="Sisa Dana" value={formatCurrency(stats.sisaDana)} />
            <StatCard icon="report" iconColor="text-error" iconBg="bg-error/10" label="Laporan Baru" value={stats.laporanBaru.toString()} />
          </div>

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
                <tbody class="font-body-md text-body-md text-on-surface">
                  {recentAspirations.map((item: any, index: number) => (
                    <tr class="border-b border-surface-variant/50 hover:bg-surface-container-lowest transition-colors">
                      <td class="py-3 px-4 text-on-surface-variant">{index + 1}</td>
                      <td class="py-3 px-4 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                      <td class="py-3 px-4">{item.sender_name}</td>
                      <td class="py-3 px-4 text-on-surface-variant">{item.category}</td>
                      <td class="py-3 px-4">
                        <StatusBadge variant={item.status} />
                      </td>
                      <td class="py-3 px-4 text-center">
                        <button class="text-primary hover:bg-primary-container hover:text-on-primary-container p-1.5 rounded-full transition-colors">
                          <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
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
    </AdminLayout>
  );
};
