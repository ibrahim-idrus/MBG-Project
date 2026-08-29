import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { FormInput } from '../components/FormInput.js';
import { Button } from '../components/Button.js';

interface MealSectionProps {
  icon: string;
  iconColor: string;
  title: string;
}

const MealSection: FC<MealSectionProps> = ({ icon, iconColor, title }) => {
  return (
    <div class="bg-surface-container-low rounded-lg p-4 mb-6 border border-surface-variant">
      <div class="flex items-center gap-2 mb-4">
        <span class={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        <h4 class="font-headline-sm text-headline-sm">{title}</h4>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div class="lg:col-span-2">
          <label class="block font-label-md text-label-md text-on-surface-variant mb-1">Nama Menu</label>
          <input class="w-full border border-outline-variant rounded p-2 text-body-sm focus:border-primary outline-none" placeholder="Contoh: Bubur Ayam" type="text" />
        </div>
        <div>
          <label class="block font-label-md text-label-md text-on-surface-variant mb-1">Kalori (kcal)</label>
          <input class="w-full border border-outline-variant rounded p-2 text-body-sm focus:border-primary outline-none text-right" placeholder="0" type="number" />
        </div>
        <div>
          <label class="block font-label-md text-label-md text-on-surface-variant mb-1">Protein (g)</label>
          <input class="w-full border border-outline-variant rounded p-2 text-body-sm focus:border-primary outline-none text-right" placeholder="0" type="number" />
        </div>
        <div>
          <label class="block font-label-md text-label-md text-on-surface-variant mb-1">Lemak (g)</label>
          <input class="w-full border border-outline-variant rounded p-2 text-body-sm focus:border-primary outline-none text-right" placeholder="0" type="number" />
        </div>
      </div>
    </div>
  );
};

export const TambahMenuPage: FC = () => {
  return (
    <AdminLayout title="Tambah Menu & Gizi" activePage="/admin/menu">
      <div class="w-full max-w-5xl mx-auto">
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-6 mb-8">
          <h3 class="font-headline-sm text-headline-sm mb-6 border-b border-surface-variant pb-2">Informasi Dasar</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <FormInput label="Tanggal" type="date" />
            <FormInput
              label="Hari"
              type="select"
              placeholder="Pilih hari"
              options={['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(d => ({value: d, label: d}))}
            />
          </div>

          <h3 class="font-headline-sm text-headline-sm mb-6 border-b border-surface-variant pb-2">Detail Menu</h3>

          <MealSection icon="wb_twilight" iconColor="text-secondary-container" title="Makan Pagi" />
          <MealSection icon="light_mode" iconColor="text-secondary" title="Makan Siang" />
          <MealSection icon="bakery_dining" iconColor="text-tertiary" title="Snack / Tambahan" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div class="bg-surface-bright rounded-lg p-4 border border-outline-variant flex flex-col justify-center">
              <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Ringkasan Total Harian</h4>
              <div class="flex justify-between items-center mb-2">
                <span class="font-body-sm text-body-sm">Total Kalori</span>
                <span class="font-headline-sm text-headline-sm text-primary">0 kcal</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="font-body-sm text-body-sm">Total Protein</span>
                <span class="font-headline-sm text-headline-sm text-secondary">0 g</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-body-sm text-body-sm">Total Lemak</span>
                <span class="font-headline-sm text-headline-sm text-tertiary">0 g</span>
              </div>
            </div>
            <div class="bg-surface-bright rounded-lg p-4 border border-outline-variant flex items-center justify-between">
              <div>
                <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Evaluasi Gizi</h4>
                <p class="font-body-sm text-body-sm text-on-surface">Kalkulasi otomatis berdasarkan standar.</p>
              </div>
              <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center border-4 border-surface-variant">
                <span class="font-display-lg text-display-lg text-on-surface-variant">-</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4">
          <Button variant="secondary" shape="rounded">Batal</Button>
          <Button variant="primary" shape="rounded">Simpan Menu</Button>
        </div>
      </div>
    </AdminLayout>
  );
};
