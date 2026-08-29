import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';

interface DayData {
  day: string;
  date: string;
  isSelected: boolean;
  isWeekend: boolean;
  menuItems: {name: string}[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const weekData: DayData[] = [
  { day: 'Senin', date: '18 Agu', isSelected: true, isWeekend: false, menuItems: [{ name: 'Nasi Putih' }, { name: 'Ayam Panggang' }, { name: 'Tumis Brokoli' }, { name: 'Jeruk' }], calories: 650, protein: 25, carbs: 80, fat: 20 },
  { day: 'Selasa', date: '19 Agu', isSelected: false, isWeekend: false, menuItems: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
  { day: 'Rabu', date: '20 Agu', isSelected: false, isWeekend: false, menuItems: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
  { day: 'Kamis', date: '21 Agu', isSelected: false, isWeekend: false, menuItems: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
  { day: 'Jumat', date: '22 Agu', isSelected: false, isWeekend: false, menuItems: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
  { day: 'Sabtu', date: '23 Agu', isSelected: false, isWeekend: true, menuItems: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
  { day: 'Minggu', date: '24 Agu', isSelected: false, isWeekend: true, menuItems: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
];

export const JadwalMenuPage: FC = () => {
  const selectedDay = weekData.find(d => d.isSelected) || weekData[0];

  return (
    <AdminLayout title="Jadwal Menu" activePage="/menu" variant="user">
      <div class="max-w-4xl w-full mx-auto">
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding">
          <h3 class="font-headline-sm text-headline-sm text-on-background mb-6">Jadwal Menu 7 Hari ke Depan</h3>

          <div class="flex overflow-x-auto pb-4 mb-6 gap-2 snap-x" style="scrollbar-width:none;-ms-overflow-style:none;">
            {weekData.map((d) => (
              <button class={`min-w-[70px] snap-start flex-shrink-0 flex flex-col items-center justify-center py-3 px-2 rounded-lg cursor-pointer transition-colors ${d.isSelected ? 'bg-tertiary-container text-on-tertiary-container border border-tertiary-container' : 'bg-surface text-on-surface-variant border border-surface-variant hover:border-outline'} ${d.isWeekend ? 'opacity-60' : ''}`}>
                <span class="font-label-md text-label-md font-bold mb-1">{d.day}</span>
                <span class="font-body-sm text-body-sm opacity-90">{d.date}</span>
              </button>
            ))}
          </div>

          <div class="border-t border-surface-variant mb-6"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="rounded-xl overflow-hidden bg-surface-container-low aspect-video md:aspect-[4/3] relative">
              <div class="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl mb-2">restaurant</span>
                <span class="font-label-md text-label-md">Foto Menu {selectedDay.day}</span>
              </div>
            </div>
            <div class="flex flex-col justify-center">
              <h4 class="font-headline-sm text-headline-sm text-on-background mb-4">Menu {selectedDay.day}, 18 Agustus 2026</h4>
              <ul class="space-y-3 pl-4">
                {selectedDay.menuItems.map((item) => (
                  <li class="relative text-on-surface font-body-lg text-body-lg pl-5 before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary">
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h4 class="font-headline-sm text-headline-sm text-on-background mb-4">Informasi Gizi</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Kalori', value: selectedDay.calories, unit: 'kcal' },
              { label: 'Protein', value: selectedDay.protein, unit: 'g' },
              { label: 'Karbohidrat', value: selectedDay.carbs, unit: 'g' },
              { label: 'Lemak', value: selectedDay.fat, unit: 'g' },
            ].map((n) => (
              <div class="border border-surface-variant rounded-lg p-4 flex flex-col items-center justify-center bg-surface hover:shadow-sm transition-shadow">
                <span class="font-label-md text-label-md text-on-surface-variant mb-1">{n.label}</span>
                <span class="font-display-lg text-display-lg text-on-background font-bold mb-1">{n.value}</span>
                <span class="font-body-sm text-body-sm text-outline">{n.unit}</span>
              </div>
            ))}
          </div>

          <div>
            <h5 class="font-label-md text-label-md text-on-background mb-2">Keterangan</h5>
            <ul class="font-body-sm text-body-sm text-on-surface-variant space-y-1 list-disc pl-4">
              <li>Informasi gizi merupakan perkiraan per porsi.</li>
              <li>Menu dapat berubah sewaktu-waktu.</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
