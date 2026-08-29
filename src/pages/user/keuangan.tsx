import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';

interface PengeluaranItem {
  no: number;
  uraian: string;
  kategori: string;
  jumlah: string;
}

const pengeluaranData: PengeluaranItem[] = [
  { no: 1, uraian: 'Beras', kategori: 'Bahan Makanan', jumlah: 'Rp5.000.000' },
  { no: 2, uraian: 'Ayam', kategori: 'Bahan Makanan', jumlah: 'Rp8.500.000' },
  { no: 3, uraian: 'Sayuran', kategori: 'Bahan Makanan', jumlah: 'Rp3.200.000' },
  { no: 4, uraian: 'Buah', kategori: 'Bahan Makanan', jumlah: 'Rp2.700.000' },
];

export const KeuanganUserPage: FC = () => {
  return (
    <AdminLayout title="Transparansi Keuangan" activePage="/keuangan" variant="user">
      <div class="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 class="font-display-lg text-display-lg text-primary mb-1">Transparansi Keuangan</h2>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Periode: 18 - 24 Agustus 2026</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer group">
            <div class="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary-container group-hover:bg-tertiary-container group-hover:text-on-tertiary transition-colors">
              <span class="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <div>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Dana Diterima</p>
              <p class="font-headline-sm text-headline-sm text-on-surface">Rp150.000.000</p>
            </div>
          </div>
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer group">
            <div class="w-12 h-12 rounded-lg bg-secondary-container/10 flex items-center justify-center text-secondary-container group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-colors">
              <span class="material-symbols-outlined">outbox</span>
            </div>
            <div>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Total Pengeluaran</p>
              <p class="font-headline-sm text-headline-sm text-on-surface">Rp127.500.000</p>
            </div>
          </div>
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer group">
            <div class="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
              <span class="material-symbols-outlined">savings</span>
            </div>
            <div>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Sisa Dana</p>
              <p class="font-headline-sm text-headline-sm text-on-surface">Rp22.500.000</p>
            </div>
          </div>
        </div>

        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest overflow-hidden">
          <div class="p-card-padding border-b border-surface-container-highest">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Rincian Pengeluaran</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
                  <th class="p-4 font-semibold">No</th>
                  <th class="p-4 font-semibold">Uraian</th>
                  <th class="p-4 font-semibold">Kategori</th>
                  <th class="p-4 font-semibold">Jumlah</th>
                  <th class="p-4 font-semibold text-center">Bukti</th>
                </tr>
              </thead>
              <tbody class="font-body-sm text-body-sm">
                {pengeluaranData.map((item) => (
                  <tr class="border-b border-surface-container-highest hover:bg-surface-bright transition-colors group">
                    <td class="p-4 text-on-surface-variant">{item.no}</td>
                    <td class="p-4 font-medium text-on-surface">{item.uraian}</td>
                    <td class="p-4 text-on-surface-variant">{item.kategori}</td>
                    <td class="p-4 text-on-surface">{item.jumlah}</td>
                    <td class="p-4 text-center">
                      <button class="text-primary hover:bg-primary-container hover:text-on-primary-container px-3 py-1 rounded-md transition-colors text-xs font-semibold">Lihat</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div class="p-4 bg-surface-container-lowest">
            <button class="w-full py-2 bg-tertiary-container/10 text-tertiary hover:bg-tertiary-container hover:text-on-tertiary rounded-lg font-label-md text-label-md transition-colors">
              Lihat Semua Pengeluaran
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Dokumen Keuangan</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-tertiary-container/10 text-tertiary rounded-lg flex items-center justify-center">
                  <span class="material-symbols-outlined">description</span>
                </div>
                <div>
                  <p class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">Rekap Pengeluaran Minggu Ini</p>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">PDF &bull; 1.2 MB</p>
                </div>
              </div>
              <button class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                <span class="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>
            <div class="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-error-container/30 text-error rounded-lg flex items-center justify-center">
                  <span class="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <p class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">Bukti Transfer Dana</p>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">PDF &bull; 845 KB</p>
                </div>
              </div>
              <button class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                <span class="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
