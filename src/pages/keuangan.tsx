import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { StatCard } from '../components/StatCard.js';
import { FormInput } from '../components/FormInput.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Button } from '../components/Button.js';
import { Modal } from '../components/Modal.js';
import { FileUpload } from '../components/FileUpload.js';
import { getFinanceStats, getTransactions } from '../db/queries.js';
import { formatCurrency } from '../utils/format.js';

export const KeuanganPage: FC = () => {
  const stats = getFinanceStats();
  const transactions = getTransactions(10);

  return (
    <AdminLayout title="Kelola Keuangan" activePage="/admin/keuangan">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="account_balance_wallet"
          iconColor="text-primary"
          iconBg="bg-primary/10"
          label="Saldo Kas Tersedia"
          value={formatCurrency(stats.saldoKas)}
          badge={<span class="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded text-[10px] font-bold">UPDATED</span>}
        />
        <StatCard
          icon="trending_up"
          iconColor="text-tertiary"
          iconBg="bg-tertiary/10"
          label="Pemasukan Bulan Ini"
          value={formatCurrency(stats.pemasukanBulanIni)}
        />
        <StatCard
          icon="trending_down"
          iconColor="text-error"
          iconBg="bg-error/10"
          label="Pengeluaran Bulan Ini"
          value={formatCurrency(stats.pengeluaranBulanIni)}
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding">
          <div class="mb-6 border-b border-surface-variant pb-4">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Catat Transaksi Baru</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Masukkan detail pemasukan atau pengeluaran operasional.</p>
          </div>
          <form class="space-y-5">
            <FormInput label="Judul Transaksi" placeholder="Misal: Pembelian Bahan Makanan" />
            <div class="grid grid-cols-2 gap-4">
              <FormInput label="Nominal (Rp)" type="number" placeholder="0" />
              <FormInput
                label="Kategori"
                type="select"
                placeholder="Pilih Kategori"
                options={[
                  { value: 'income', label: 'Pemasukan (Dana Bos)' },
                  { value: 'expense_food', label: 'Pengeluaran (Bahan Makanan)' },
                  { value: 'expense_ops', label: 'Pengeluaran (Operasional)' },
                ]}
              />
            </div>
            <FormInput label="Tanggal Transaksi" type="date" />
            <FormInput label="Deskripsi Tambahan" type="textarea" placeholder="Catatan opsional..." />
            <FileUpload label="Dokumen Pendukung (Bukti/Kwitansi)" />
            <div class="pt-4 flex justify-end gap-3">
              <Button variant="secondary" shape="rounded">Batal</Button>
              <Button variant="primary" shape="rounded">Simpan Transaksi</Button>
            </div>
          </form>
        </div>

        <div class="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div class="p-card-padding border-b border-surface-variant flex justify-between items-center bg-surface-container-lowest">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Riwayat Transaksi Terbaru</h3>
            <a href="#" class="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
              Lihat Semua <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container-low border-b border-surface-variant">
                  <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Tanggal</th>
                  <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Keterangan</th>
                  <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4">Kategori</th>
                  <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4 text-right">Nominal</th>
                  <th class="font-label-md text-label-md text-on-surface-variant py-3 px-4 text-center">Dokumen</th>
                </tr>
              </thead>
              <tbody class="font-body-md text-body-md text-on-surface">
                {transactions.map((tx: any) => (
                  <tr
                    class="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors group cursor-pointer"
                    onclick={`document.getElementById('detail-modal').classList.remove('hidden')`}
                  >
                    <td class="py-4 px-4 whitespace-nowrap">{new Date(tx.transaction_date).toLocaleDateString('id-ID')}</td>
                    <td class="py-4 px-4">
                      <div class="font-medium">{tx.title}</div>
                      <div class="text-[11px] text-on-surface-variant mt-0.5">{tx.description}</div>
                    </td>
                    <td class="py-4 px-4">
                      <StatusBadge variant={tx.type === 'IN' ? 'masuk' : 'keluar'} />
                    </td>
                    <td class={`py-4 px-4 text-right font-medium ${tx.type === 'OUT' ? 'text-error' : 'text-tertiary'}`}>{formatCurrency(tx.amount)}</td>
                    <td class="py-4 px-4 text-center">
                      {tx.document_url && (
                        <button class="text-outline hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-high" title="Lihat Dokumen">
                          <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        id="detail-modal"
        title="Detail Transaksi"
        footer={
          <Button variant="primary" shape="pill" onclick={`document.getElementById('detail-modal').classList.add('hidden')`}>
            Tutup
          </Button>
        }
      >
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-label-md font-label-md text-on-surface-variant mb-1">ID Transaksi</p>
            <p class="text-body-md font-medium">#TRX-20231024-001</p>
          </div>
          <div>
            <p class="text-label-md font-label-md text-on-surface-variant mb-1">Tanggal</p>
            <p class="text-body-md font-medium">24 Okt 2023</p>
          </div>
          <div>
            <p class="text-label-md font-label-md text-on-surface-variant mb-1">Nominal</p>
            <p class="text-body-md font-bold text-error">Rp 2.500.000</p>
          </div>
          <div>
            <p class="text-label-md font-label-md text-on-surface-variant mb-1">Kategori</p>
            <StatusBadge variant="keluar" />
          </div>
        </div>
        <div>
          <p class="text-label-md font-label-md text-on-surface-variant mb-2">Deskripsi & Alasan</p>
          <div class="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
            <p class="text-body-md text-on-surface">Pembelian stok beras 50kg dan sayuran segar untuk kebutuhan dapur asrama periode akhir Oktober. Supplier: PD. Makmur.</p>
          </div>
        </div>
        <div>
          <p class="text-label-md font-label-md text-on-surface-variant mb-2">Dokumen Pendukung</p>
          <div class="relative group cursor-pointer border border-outline-variant rounded-lg overflow-hidden bg-surface-container">
            <div class="aspect-video flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-outline">receipt_long</span>
            </div>
            <div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="bg-surface-container-lowest px-3 py-1.5 rounded-full text-label-md font-label-md text-primary shadow-sm">Lihat Fullscreen</span>
            </div>
          </div>
          <p class="text-[11px] text-on-surface-variant mt-2">kwitansi_pembelian_beras_241023.pdf (1.2 MB)</p>
        </div>
      </Modal>
    </AdminLayout>
  );
};
