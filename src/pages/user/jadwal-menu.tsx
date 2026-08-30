import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { getMenusByDate } from '../../db/queries.js';

export const JadwalMenuPage: FC = () => {
  // Get menus for today
  const today = new Date().toISOString().split('T')[0];
  const todayMenus = getMenusByDate(today) as any[];

  // Group menus by meal type
  const breakfastMenus = todayMenus.filter(m => m.meal_type === 'breakfast');
  const lunchMenus = todayMenus.filter(m => m.meal_type === 'lunch');
  const snackMenus = todayMenus.filter(m => m.meal_type === 'snack');

  // Calculate totals
  const totalCalories = todayMenus.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = todayMenus.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = todayMenus.reduce((sum, m) => sum + (m.carbohydrates || 0), 0);
  const totalFat = todayMenus.reduce((sum, m) => sum + (m.fat || 0), 0);

  return (
    <AdminLayout title="Jadwal Menu" activePage="/menu" variant="user">
      <div class="max-w-4xl w-full mx-auto">
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding">
          <h3 class="font-headline-sm text-headline-sm text-on-background mb-6">Menu Hari Ini</h3>

          <div class="border-t border-surface-variant mb-6"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="rounded-xl overflow-hidden bg-surface-container-low aspect-video md:aspect-[4/3] relative">
              <div class="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl mb-2">restaurant</span>
                <span class="font-label-md text-label-md">Foto Menu Hari Ini</span>
              </div>
            </div>
            <div class="flex flex-col justify-center">
              <h4 class="font-headline-sm text-headline-sm text-on-background mb-4">Menu Hari Ini</h4>
              
              {/* Breakfast */}
              {breakfastMenus.length > 0 && (
                <div class="mb-4">
                  <p class="font-label-md text-label-md text-on-surface-variant mb-2">Sarapan</p>
                  <ul class="space-y-2 pl-4">
                    {breakfastMenus.map((menu) => (
                      <li class="relative text-on-surface font-body-md text-body-md pl-5 before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-secondary-container">
                        {menu.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lunch */}
              {lunchMenus.length > 0 && (
                <div class="mb-4">
                  <p class="font-label-md text-label-md text-on-surface-variant mb-2">Makan Siang</p>
                  <ul class="space-y-2 pl-4">
                    {lunchMenus.map((menu) => (
                      <li class="relative text-on-surface font-body-md text-body-md pl-5 before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary-container">
                        {menu.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Snack */}
              {snackMenus.length > 0 && (
                <div class="mb-4">
                  <p class="font-label-md text-label-md text-on-surface-variant mb-2">Snack</p>
                  <ul class="space-y-2 pl-4">
                    {snackMenus.map((menu) => (
                      <li class="relative text-on-surface font-body-md text-body-md pl-5 before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-tertiary-container">
                        {menu.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {todayMenus.length === 0 && (
                <p class="text-on-surface-variant font-body-md">Belum ada menu untuk hari ini.</p>
              )}
            </div>
          </div>

          <h4 class="font-headline-sm text-headline-sm text-on-background mb-4">Informasi Gizi</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Kalori', value: totalCalories, unit: 'kcal' },
              { label: 'Protein', value: totalProtein, unit: 'g' },
              { label: 'Karbohidrat', value: totalCarbs, unit: 'g' },
              { label: 'Lemak', value: totalFat, unit: 'g' },
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
