import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { StatCard } from '../components/StatCard.js';

export const StatistikPage: FC = () => {
  return (
    <AdminLayout title="Statistik Keuangan Tahunan" activePage="/admin/keuangan">
      <div class="mb-8">
        <h2 class="font-display-lg text-display-lg text-on-surface mb-2">Laporan Tahunan 2024</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Ringkasan performa keuangan dan statistik tahunan.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon="trending_up" iconColor="text-tertiary" iconBg="bg-tertiary/10" label="Total Pemasukan Tahunan" value="Rp 12.450.000.000" />
        <StatCard icon="trending_down" iconColor="text-error" iconBg="bg-error/10" label="Total Pengeluaran Tahunan" value="Rp 8.920.000.000" />
        <StatCard icon="speed" iconColor="text-primary" iconBg="bg-primary/10" label="Efisiensi Anggaran" value="78.5%" />
      </div>

      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div class="p-card-padding border-b border-surface-variant">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Top 5 Transaksi Terbesar</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-surface-variant">
                <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">ID Transaksi</th>
                <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Tanggal</th>
                <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Deskripsi</th>
                <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Kategori</th>
                <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4 text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody class="font-body-md text-body-md text-on-surface">
              <tr class="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                <td class="py-3 px-4 text-primary font-medium">TRX-9982</td>
                <td class="py-3 px-4">12 Nov 2024</td>
                <td class="py-3 px-4">Pengadaan Suplai Daging Q4</td>
                <td class="py-3 px-4"><span class="bg-primary-container/20 text-primary px-2 py-1 rounded text-xs font-semibold">BAHAN MAKANAN</span></td>
                <td class="py-3 px-4 text-right font-medium">450.000.000</td>
              </tr>
              <tr class="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                <td class="py-3 px-4 text-primary font-medium">TRX-8741</td>
                <td class="py-3 px-4">05 Okt 2024</td>
                <td class="py-3 px-4">Perpanjangan Kontrak Armada Truk</td>
                <td class="py-3 px-4"><span class="bg-secondary-container/20 text-secondary px-2 py-1 rounded text-xs font-semibold">LOGISTIK</span></td>
                <td class="py-3 px-4 text-right font-medium">320.500.000</td>
              </tr>
              <tr class="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                <td class="py-3 px-4 text-primary font-medium">TRX-7102</td>
                <td class="py-3 px-4">22 Sep 2024</td>
                <td class="py-3 px-4">Pembangunan Fasilitas Penyimpanan</td>
                <td class="py-3 px-4"><span class="bg-tertiary-container/20 text-tertiary px-2 py-1 rounded text-xs font-semibold">OPERASIONAL</span></td>
                <td class="py-3 px-4 text-right font-medium">275.000.000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
