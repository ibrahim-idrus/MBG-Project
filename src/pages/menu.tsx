import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { Button } from '../components/Button.js';
import { getMenuStats, getMenusByDate } from '../db/queries.js';

export const MenuPage: FC = () => {
  const stats = getMenuStats();
  
  // Get menus for today
  const today = new Date().toISOString().split('T')[0];
  const todayMenus = getMenusByDate(today);

  // Group menus by meal type
  const breakfastMenus = todayMenus.filter((m: any) => m.meal_type === 'breakfast') as any[];
  const lunchMenus = todayMenus.filter((m: any) => m.meal_type === 'lunch') as any[];
  const snackMenus = todayMenus.filter((m: any) => m.meal_type === 'snack') as any[];

  return (
    <AdminLayout title="Menu & Gizi" activePage="/admin/menu">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 class="font-display-lg text-display-lg text-on-surface">Jadwal Menu Harian</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1">Kelola dan pantau nilai gizi untuk hari ini.</p>
        </div>
        <Button variant="primary" shape="pill">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit Menu
        </Button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] col-span-1">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-2">Total Menu Hari Ini</p>
          <div class="flex items-end gap-2">
            <span class="font-display-lg text-display-lg text-on-surface">{todayMenus.length}</span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">menu tersedia</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Rata-rata Kalori/Hari</p>
          <p class="font-headline-md text-headline-md text-on-surface">{stats.avgCalories.toLocaleString()}</p>
          <p class="font-body-sm text-body-sm text-outline">kcal</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Rata-rata Protein/Hari</p>
          <p class="font-headline-md text-headline-md text-on-surface">{stats.avgProtein.toLocaleString()}</p>
          <p class="font-body-sm text-body-sm text-outline">g</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Menu</p>
          <p class="font-headline-md text-headline-md text-on-surface">{stats.totalMenus.toLocaleString()}</p>
          <p class="font-body-sm text-body-sm text-outline">menu</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Tipe Menu</p>
          <p class="font-headline-md text-headline-md text-on-surface">3</p>
          <p class="font-body-sm text-body-sm text-outline">jenis</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Breakfast Section */}
        {breakfastMenus.length > 0 && (
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <div class="p-4 border-b border-surface-variant flex justify-between items-center">
              <p class="font-headline-sm text-headline-sm text-on-surface">Sarapan</p>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container">Pagi</span>
            </div>
            <div class="p-4">
              <div class="space-y-2">
                {breakfastMenus.map((menu: any) => (
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px] text-on-surface-variant">restaurant</span>
                    <span class="font-body-sm text-body-sm text-on-surface">{menu.name}</span>
                  </div>
                ))}
              </div>
              {breakfastMenus[0]?.calories && (
                <div class="mt-3 pt-3 border-t border-surface-variant">
                  <span class="font-label-md text-label-md text-primary">{breakfastMenus[0].calories} kcal</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lunch Section */}
        {lunchMenus.length > 0 && (
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <div class="p-4 border-b border-surface-variant flex justify-between items-center">
              <p class="font-headline-sm text-headline-sm text-on-surface">Makan Siang</p>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-container text-on-primary-container">Siang</span>
            </div>
            <div class="p-4">
              <div class="space-y-2">
                {lunchMenus.map((menu: any) => (
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px] text-on-surface-variant">restaurant</span>
                    <span class="font-body-sm text-body-sm text-on-surface">{menu.name}</span>
                  </div>
                ))}
              </div>
              {lunchMenus[0]?.calories && (
                <div class="mt-3 pt-3 border-t border-surface-variant">
                  <span class="font-label-md text-label-md text-primary">{lunchMenus[0].calories} kcal</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Snack Section */}
        {snackMenus.length > 0 && (
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <div class="p-4 border-b border-surface-variant flex justify-between items-center">
              <p class="font-headline-sm text-headline-sm text-on-surface">Snack</p>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-container text-on-tertiary-container">Sore</span>
            </div>
            <div class="p-4">
              <div class="space-y-2">
                {snackMenus.map((menu: any) => (
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px] text-on-surface-variant">restaurant</span>
                    <span class="font-body-sm text-body-sm text-on-surface">{menu.name}</span>
                  </div>
                ))}
              </div>
              {snackMenus[0]?.calories && (
                <div class="mt-3 pt-3 border-t border-surface-variant">
                  <span class="font-label-md text-label-md text-primary">{snackMenus[0].calories} kcal</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No menus message */}
        {todayMenus.length === 0 && (
          <div class="col-span-full bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-4">no_meals</span>
            <p class="font-body-md text-body-md text-on-surface-variant">Belum ada menu untuk hari ini.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
