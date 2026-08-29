import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { StatCard } from '../components/StatCard.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Button } from '../components/Button.js';
import { Modal } from '../components/Modal.js';

interface AspirasiItem {
  nama: string;
  inisial: string;
  avatarColor: string;
  tanggal: string;
  kategori: string;
  aspirasi: string;
  status: 'pending' | 'proses' | 'selesai' | 'ditolak';
}

const aspirasiData: AspirasiItem[] = [
  { nama: 'Budi Santoso', inisial: 'AN', avatarColor: 'bg-secondary-fixed text-on-secondary-fixed', tanggal: '24 Okt 2023, 14:30', kategori: 'Makanan', aspirasi: 'Porsi makan siang hari ini terasa kurang mengenyangkan dibandingkan biasanya...', status: 'pending' },
  { nama: 'Siti Wahyuni', inisial: 'SW', avatarColor: 'bg-primary-fixed text-on-primary-fixed', tanggal: '24 Okt 2023, 10:15', kategori: 'Fasilitas', aspirasi: 'AC di ruang makan sektor B sepertinya rusak, sangat panas saat jam istirahat.', status: 'proses' },
  { nama: 'Agus Pratama', inisial: 'AP', avatarColor: 'bg-tertiary-fixed text-on-tertiary-fixed', tanggal: '23 Okt 2023, 16:45', kategori: 'Umum', aspirasi: 'Sistem pendaftaran antrean kemarin sempat down selama 15 menit.', status: 'selesai' },
  { nama: 'Dian Wulandari', inisial: 'DW', avatarColor: 'bg-error-container text-on-error-container', tanggal: '23 Okt 2023, 09:10', kategori: 'Makanan', aspirasi: 'Tolong sediakan menu lobster untuk makan siang besok.', status: 'ditolak' },
];

export const AspirasiPage: FC = () => {
  return (
    <AdminLayout title="Manajemen Aspirasi" activePage="/admin/aspirasi">
      <div class="mb-8">
        <h2 class="font-display-lg text-display-lg font-bold text-on-surface">Manajemen Aspirasi</h2>
        <p class="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl">Pantau dan kelola umpan balik, saran, serta keluhan pengguna terkait program MBG secara terpusat untuk memastikan transparansi dan tindak lanjut yang efektif.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        <StatCard icon="inbox" iconColor="text-primary-container" iconBg="bg-primary-container/20" label="Total Aspirasi" value="1,248" />
        <StatCard icon="pending_actions" iconColor="text-secondary-container" iconBg="bg-secondary-container/20" label="Belum Ditanggapi" value="56" />
        <StatCard icon="sync" iconColor="text-blue-600" iconBg="bg-blue-100" label="Dalam Proses" value="124" />
        <StatCard icon="task_alt" iconColor="text-tertiary-container" iconBg="bg-tertiary-container/20" label="Selesai" value="1,068" />
      </div>

      <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div class="p-card-padding border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 class="font-headline-md text-headline-md text-on-surface">Daftar Aspirasi Terbaru</h3>
          <div class="flex items-center gap-2">
            <Button variant="ghost" shape="pill">
              <span class="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </Button>
            <Button variant="primary" shape="pill">
              <span class="material-symbols-outlined text-[18px]">download</span>
              Ekspor
            </Button>
          </div>
        </div>
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant">
                <th class="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nama User</th>
                <th class="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tanggal</th>
                <th class="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Kategori</th>
                <th class="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Aspirasi</th>
                <th class="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th class="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
              {aspirasiData.map((item) => (
                <tr class="hover:bg-surface-container-low transition-colors group cursor-pointer" onclick={`document.getElementById('aspirasi-detail-modal').classList.remove('hidden')`}>
                  <td class="p-4 flex items-center gap-3">
                    <div class={`w-8 h-8 rounded-full ${item.avatarColor} flex items-center justify-center font-bold text-xs`}>{item.inisial}</div>
                    <span class="font-semibold">{item.nama}</span>
                  </td>
                  <td class="p-4 text-on-surface-variant">{item.tanggal}</td>
                  <td class="p-4">{item.kategori}</td>
                  <td class="p-4 max-w-xs truncate text-on-surface-variant">{item.aspirasi}</td>
                  <td class="p-4"><StatusBadge variant={item.status} /></td>
                  <td class="p-4 text-center">
                    <button class="text-primary font-semibold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center mx-auto gap-1">
                      Detail <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div class="p-4 border-t border-outline-variant flex items-center justify-between text-body-sm text-on-surface-variant">
          <span>Menampilkan 1-4 dari 1,248 aspirasi</span>
          <div class="flex items-center gap-1">
            <button class="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-50" disabled><span class="material-symbols-outlined text-[20px]">chevron_left</span></button>
            <button class="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center">1</button>
            <button class="w-8 h-8 rounded hover:bg-surface-container transition-colors flex items-center justify-center">2</button>
            <button class="w-8 h-8 rounded hover:bg-surface-container transition-colors flex items-center justify-center">3</button>
            <span>...</span>
            <button class="p-1 rounded hover:bg-surface-container transition-colors"><span class="material-symbols-outlined text-[20px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      <Modal
        id="aspirasi-detail-modal"
        title="Detail Aspirasi"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" shape="rounded" onclick={`document.getElementById('aspirasi-detail-modal').classList.add('hidden')`}>Batal</Button>
            <Button variant="primary" shape="rounded">Kirim Balasan & Simpan Status</Button>
          </>
        }
      >
        <div>
          <h4 class="font-semibold text-on-surface text-lg">Budi Santoso</h4>
          <p class="text-body-sm text-on-surface-variant">Makanan &bull; 24 Okt 2023, 14:30</p>
        </div>
        <div class="space-y-2">
          <label class="font-label-md text-label-md text-on-surface-variant uppercase">Pesan User</label>
          <div class="bg-surface-container-low p-4 rounded-lg border border-outline-variant">
            <p class="text-body-md text-on-surface leading-relaxed">Porsi makan siang hari ini terasa kurang mengenyangkan, terutama untuk lauk proteinnya. Mohon bisa ditinjau kembali standar porsinya agar gizi anak-anak terpenuhi dengan baik.</p>
          </div>
        </div>
        <div class="space-y-3">
          <label class="font-label-md text-label-md text-on-surface-variant uppercase">Berikan Tanggapan</label>
          <textarea class="w-full p-4 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-transparent text-body-md min-h-[120px]" placeholder="Tulis balasan Anda di sini..."></textarea>
        </div>
        <div class="space-y-2">
          <label class="font-label-md text-label-md text-on-surface-variant uppercase">Update Status</label>
          <select class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer">
            <option value="pending" selected>Pending</option>
            <option value="proses">Proses</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </Modal>
    </AdminLayout>
  );
};
