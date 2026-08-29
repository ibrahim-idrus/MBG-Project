import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { Button } from '../../components/Button.js';
import { Modal } from '../../components/Modal.js';

interface DapurItem {
  nama: string;
  yayasan: string;
  wilayah: string;
  sekolah: number;
  siswa: string;
}

const dapurData: DapurItem[] = [
  { nama: 'Dapur Pusat Jakarta Selatan', yayasan: 'Yayasan Harapan Bangsa', wilayah: 'DKI Jakarta', sekolah: 42, siswa: '15,420' },
  { nama: 'Dapur Utama Bandung Timur', yayasan: 'Yayasan Pendidikan Jabar', wilayah: 'Jawa Barat', sekolah: 38, siswa: '12,100' },
  { nama: 'Sentra Gizi Surabaya Utara', yayasan: 'Yayasan Generasi Emas', wilayah: 'Jawa Timur', sekolah: 55, siswa: '22,350' },
];

interface SekolahItem {
  nama: string;
  alamat: string;
  siswa: number;
}

const sekolahData: SekolahItem[] = [
  { nama: 'SDN Cilandak Barat 04', alamat: 'Jl. Caringin Utara No. 12', siswa: 450 },
  { nama: 'SMPN 85 Jakarta', alamat: 'Jl. Margasatwa Raya', siswa: 820 },
  { nama: 'SDIT Nurul Fikri', alamat: 'Komp. Tugu Asri', siswa: 315 },
];

export const LokasiPage: FC = () => {
  return (
    <AdminLayout title="Lokasi & Sekolah" activePage="/" variant="user">
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h2 class="font-display-lg text-display-lg text-on-surface mb-2">Lokasi & Sekolah MBG</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">Kelola daftar Dapur Umum dan sekolah yang dilayani.</p>
        </div>
        <Button variant="primary" shape="pill">
          <span class="material-symbols-outlined text-[18px]">add</span>
          Tambah Lokasi
        </Button>
      </div>

      <div class="grid grid-cols-12 gap-gutter">
        <div class="col-span-12 md:col-span-4 flex flex-col gap-gutter">
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all">
            <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4">
              <span class="material-symbols-outlined">domain</span>
            </div>
            <h3 class="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Dapur Umum</h3>
            <p class="font-headline-md text-headline-md text-on-surface">142 Unit</p>
          </div>
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all">
            <div class="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-4">
              <span class="material-symbols-outlined">school</span>
            </div>
            <h3 class="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Sekolah Dilayani</h3>
            <p class="font-headline-md text-headline-md text-on-surface">3,450 Sekolah</p>
          </div>
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all">
            <div class="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary mb-4">
              <span class="material-symbols-outlined">group</span>
            </div>
            <h3 class="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Siswa</h3>
            <p class="font-headline-md text-headline-md text-on-surface">1.2M Siswa</p>
          </div>
        </div>

        <div class="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
          <div class="p-card-padding border-b border-surface-variant flex justify-between items-center bg-surface-bright/50">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Daftar Dapur Umum (Providing Offices)</h3>
            <button class="text-primary font-label-md text-label-md flex items-center gap-1 hover:bg-primary-fixed/50 px-3 py-1.5 rounded-full transition-colors">
              <span class="material-symbols-outlined text-[16px]">filter_list</span>
              Filter
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-surface-container-low border-b border-surface-variant">
                <tr>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Nama Dapur Umum</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Wilayah</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">Jml Sekolah</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">Jml Siswa</th>
                  <th class="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody class="font-body-sm text-body-sm text-on-surface">
                {dapurData.map((item) => (
                  <tr class="border-b border-surface-variant/50 hover:bg-surface-container-lowest hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer group" onclick={`document.getElementById('location-modal').classList.remove('hidden')`}>
                    <td class="py-4 px-4">
                      <div class="font-headline-sm text-headline-sm text-primary mb-1 group-hover:underline">{item.nama}</div>
                      <div class="text-on-surface-variant">{item.yayasan}</div>
                    </td>
                    <td class="py-4 px-4">{item.wilayah}</td>
                    <td class="py-4 px-4 text-center">{item.sekolah}</td>
                    <td class="py-4 px-4 text-right">{item.siswa}</td>
                    <td class="py-4 px-4 text-right">
                      <button class="text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary-fixed rounded-full">
                        <span class="material-symbols-outlined">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div class="p-4 bg-surface-bright border-t border-surface-variant flex justify-center">
            <button class="text-primary font-label-md text-label-md hover:bg-primary-fixed/50 px-4 py-2 rounded-full transition-colors">Muat Lebih Banyak</button>
          </div>
        </div>
      </div>

      <Modal id="location-modal" title="Detail Dapur Umum" maxWidth="max-w-2xl">
        <div>
          <h2 class="font-display-lg text-display-lg text-primary mb-2">Dapur Pusat Jakarta Selatan</h2>
          <div class="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-4">
            <span class="bg-primary-fixed text-primary px-2 py-1 rounded-md font-label-md text-label-md">Aktif</span>
            <span>&bull; DKI Jakarta</span>
            <span>&bull; ID: DPJS-001</span>
          </div>
        </div>
        <div class="w-full h-48 bg-surface-container-high rounded-xl overflow-hidden relative border border-surface-variant">
          <div class="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl mb-2">map</span>
            <span class="font-label-md text-label-md">Peta Lokasi Dapur Pusat</span>
            <span class="font-body-sm text-body-sm opacity-70">Jakarta Selatan</span>
          </div>
          <div class="absolute bottom-3 right-3 bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm text-xs font-label-md text-on-surface flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px] text-primary">location_on</span>
            Lihat di Maps
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-surface-bright p-4 rounded-lg border border-surface-variant/50">
            <div class="text-on-surface-variant font-label-md text-label-md mb-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">business</span>
              Yayasan Penanggung Jawab
            </div>
            <div class="font-headline-sm text-headline-sm text-on-surface">Yayasan Harapan Bangsa</div>
          </div>
          <div class="bg-surface-bright p-4 rounded-lg border border-surface-variant/50">
            <div class="text-on-surface-variant font-label-md text-label-md mb-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">contact_phone</span>
              Kontak Utama
            </div>
            <div class="font-headline-sm text-headline-sm text-on-surface">Bpk. Budi Santoso</div>
            <div class="font-body-sm text-body-sm text-on-surface-variant">+62 812-3456-7890</div>
          </div>
          <div class="col-span-2 bg-surface-bright p-4 rounded-lg border border-surface-variant/50">
            <div class="text-on-surface-variant font-label-md text-label-md mb-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">map</span>
              Alamat Lengkap
            </div>
            <div class="font-body-md text-body-md text-on-surface">Jl. TB Simatupang No. 45, Cilandak, Jakarta Selatan, DKI Jakarta 12430</div>
          </div>
        </div>
        <div>
          <div class="flex justify-between items-end mb-4">
            <h4 class="font-headline-sm text-headline-sm text-on-surface">Sekolah yang Dilayani (42)</h4>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
              <input class="pl-8 pr-3 py-1.5 bg-surface-container-low border-none rounded-md font-body-sm text-body-sm w-48 focus:ring-1 focus:ring-primary" placeholder="Cari sekolah..." type="text" />
            </div>
          </div>
          <div class="border border-surface-variant rounded-lg overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-surface-container-low border-b border-surface-variant">
                <tr>
                  <th class="py-2 px-4 font-label-md text-label-md text-on-surface-variant">Nama Sekolah</th>
                  <th class="py-2 px-4 font-label-md text-label-md text-on-surface-variant text-right">Jml Siswa</th>
                </tr>
              </thead>
              <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant/50">
                {sekolahData.map((s) => (
                  <tr class="hover:bg-surface-bright transition-colors">
                    <td class="py-3 px-4">
                      <div class="font-headline-sm text-headline-sm text-on-surface">{s.nama}</div>
                      <div class="text-on-surface-variant text-[11px] truncate w-64">{s.alamat}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-headline-sm text-headline-sm text-primary">{s.siswa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div class="p-3 bg-surface-bright text-center">
              <button class="text-primary font-label-md text-label-md hover:underline">Lihat Semua 42 Sekolah</button>
            </div>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};
