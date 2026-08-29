import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { FormInput } from '../../components/FormInput.js';
import { Button } from '../../components/Button.js';

export const LaporanPage: FC = () => {
  return (
    <AdminLayout title="Laporan & Kritik" activePage="/laporan" variant="user">
      <div class="w-full min-h-screen flex justify-center items-start">
        <div class="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant p-6 md:p-card-padding mt-4 md:mt-8">
          <div class="mb-8">
            <h2 class="font-headline-md text-headline-md text-on-surface mb-2">Buat Laporan</h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Sampaikan kritik atau laporan terkait pelayanan dapur MBG.</p>
          </div>
          <form class="space-y-6">
            <FormInput
              label="Kategori Laporan"
              type="select"
              placeholder="Pilih kategori"
              options={[
                { value: 'kualitas', label: 'Kualitas Makanan' },
                { value: 'pelayanan', label: 'Pelayanan Staff' },
                { value: 'fasilitas', label: 'Fasilitas Dapur' },
                { value: 'lainnya', label: 'Lainnya' },
              ]}
            />
            <FormInput
              label="Dapur MBG"
              type="select"
              placeholder="Pilih dapur"
              options={[
                { value: 'dapur1', label: 'Dapur Utama Pusat' },
                { value: 'dapur2', label: 'Dapur Cabang Utara' },
                { value: 'dapur3', label: 'Dapur Cabang Selatan' },
              ]}
            />
            <div class="flex flex-col gap-2">
              <label class="font-label-md text-label-md text-on-surface">Foto (Opsional)</label>
              <div class="w-full border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200 flex flex-col items-center justify-center p-8 cursor-pointer relative group">
                <input accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file" />
                <span class="material-symbols-outlined text-outline group-hover:text-primary text-4xl mb-3 transition-colors">image</span>
                <p class="font-body-sm text-body-sm text-on-surface-variant text-center">
                  Klik untuk upload foto<br />atau drag & drop
                </p>
              </div>
            </div>
            <FormInput label="Deskripsi" type="textarea" placeholder="Tulis detail laporan Anda..." rows={4} />
            <div class="pt-4">
              <Button variant="primary" shape="rounded" className="w-full bg-[#34A853] hover:bg-[#2c8d45] text-white">
                Kirim Laporan
                <span class="material-symbols-outlined" style="font-size: 18px;">send</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
