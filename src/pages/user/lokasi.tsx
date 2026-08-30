import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { getKitchens, getSchools } from '../../db/queries.js';

export const LokasiPage: FC = () => {
  const kitchens = getKitchens() as any[];
  const schools = getSchools() as any[];

  // Pre-compute school stats per kitchen
  const kitchenStats = new Map<string, { schoolCount: number; studentCount: number }>();
  for (const school of schools) {
    const existing = kitchenStats.get(school.kitchen_name) || { schoolCount: 0, studentCount: 0 };
    existing.schoolCount++;
    existing.studentCount += school.student_count;
    kitchenStats.set(school.kitchen_name, existing);
  }

  const totalSchools = schools.length;
  const totalStudents = schools.reduce((sum: number, s: any) => sum + s.student_count, 0);

  // Initial display limit
  const INITIAL_LIMIT = 5;
  const hasMoreKitchens = kitchens.length > INITIAL_LIMIT;
  const hasMoreSchools = schools.length > INITIAL_LIMIT;

  return (
    <AdminLayout title="Lokasi & Sekolah" activePage="/" variant="user">
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h2 class="font-display-lg text-display-lg text-on-surface mb-2">Lokasi & Sekolah MBG</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">Daftar Dapur MBG dan sekolah yang dilayani.</p>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-gutter">
        <div class="col-span-12 md:col-span-4 flex flex-col gap-gutter">
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all">
            <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4">
              <span class="material-symbols-outlined">domain</span>
            </div>
            <h3 class="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Dapur Umum</h3>
            <p class="font-headline-md text-headline-md text-on-surface">{kitchens.length} Unit</p>
          </div>
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all">
            <div class="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-4">
              <span class="material-symbols-outlined">school</span>
            </div>
            <h3 class="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Sekolah Dilayani</h3>
            <p class="font-headline-md text-headline-md text-on-surface">{totalSchools.toLocaleString()} Sekolah</p>
          </div>
          <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all">
            <div class="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary mb-4">
              <span class="material-symbols-outlined">group</span>
            </div>
            <h3 class="font-body-sm text-body-sm text-on-surface-variant mb-1">Total Siswa</h3>
            <p class="font-headline-md text-headline-md text-on-surface">{totalStudents.toLocaleString()} Siswa</p>
          </div>
        </div>

        {/* Kitchen List */}
        <div class="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
          <div class="p-card-padding border-b border-surface-variant flex justify-between items-center bg-surface-bright/50">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Daftar Dapur Umum</h3>
            <span class="text-on-surface-variant font-body-sm text-body-sm">{kitchens.length} dapur</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-surface-container-low border-b border-surface-variant">
                <tr>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Nama Dapur</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Wilayah</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">Kapasitas</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">Sekolah</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">Siswa</th>
                </tr>
              </thead>
              <tbody class="font-body-sm text-body-sm text-on-surface">
                {kitchens.map((kitchen: any, index: number) => {
                  const stats = kitchenStats.get(kitchen.name) || { schoolCount: 0, studentCount: 0 };
                  return (
                    <tr 
                      class={`border-b border-surface-variant/50 hover:bg-surface-container-lowest transition-colors ${index >= INITIAL_LIMIT ? 'hidden kitchen-extra' : ''}`}
                    >
                      <td class="py-4 px-4">
                        <div class="font-headline-sm text-headline-sm text-on-surface mb-1">{kitchen.name}</div>
                        <div class="text-on-surface-variant text-xs">{kitchen.code}</div>
                      </td>
                      <td class="py-4 px-4 text-on-surface-variant">{kitchen.city}, {kitchen.province}</td>
                      <td class="py-4 px-4 text-center">{kitchen.capacity.toLocaleString()}</td>
                      <td class="py-4 px-4 text-center">{stats.schoolCount}</td>
                      <td class="py-4 px-4 text-right">{stats.studentCount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasMoreKitchens && (
            <div class="p-4 bg-surface-bright border-t border-surface-variant flex justify-center">
              <button 
                class="text-primary font-label-md text-label-md hover:bg-primary-fixed/50 px-6 py-2 rounded-full transition-colors flex items-center gap-2"
                onclick="document.querySelectorAll('.kitchen-extra').forEach(el => el.classList.remove('hidden')); this.parentElement.style.display='none';"
              >
                <span class="material-symbols-outlined text-[18px]">expand_more</span>
                Muat Lebih Banyak ({kitchens.length - INITIAL_LIMIT} lagi)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* School List */}
      <div class="mt-8 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
        <div class="p-card-padding border-b border-surface-variant flex justify-between items-center bg-surface-bright/50">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Daftar Sekolah</h3>
          <span class="text-on-surface-variant font-body-sm text-body-sm">{totalSchools} sekolah</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low border-b border-surface-variant">
              <tr>
                <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Nama Sekolah</th>
                <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">NPSN</th>
                <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Dapur MBG</th>
                <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Wilayah</th>
                <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">Siswa</th>
              </tr>
            </thead>
            <tbody class="font-body-sm text-body-sm text-on-surface">
              {schools.map((school: any, index: number) => (
                <tr 
                  class={`border-b border-surface-variant/50 hover:bg-surface-container-lowest transition-colors ${index >= INITIAL_LIMIT ? 'hidden school-extra' : ''}`}
                >
                  <td class="py-4 px-4">
                    <div class="font-headline-sm text-headline-sm text-on-surface">{school.name}</div>
                    <div class="text-on-surface-variant text-xs truncate max-w-xs">{school.address}</div>
                  </td>
                  <td class="py-4 px-4 text-on-surface-variant font-mono text-xs">{school.npsn}</td>
                  <td class="py-4 px-4 text-on-surface-variant">{school.kitchen_name}</td>
                  <td class="py-4 px-4 text-on-surface-variant">{school.city}, {school.province}</td>
                  <td class="py-4 px-4 text-right font-medium">{school.student_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMoreSchools && (
          <div class="p-4 bg-surface-bright border-t border-surface-variant flex justify-center">
            <button 
              class="text-primary font-label-md text-label-md hover:bg-primary-fixed/50 px-6 py-2 rounded-full transition-colors flex items-center gap-2"
              onclick="document.querySelectorAll('.school-extra').forEach(el => el.classList.remove('hidden')); this.parentElement.style.display='none';"
            >
              <span class="material-symbols-outlined text-[18px]">expand_more</span>
              Muat Lebih Banyak ({totalSchools - INITIAL_LIMIT} lagi)
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
