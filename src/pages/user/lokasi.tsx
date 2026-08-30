import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { getKitchens, getSchools, getKitchenById, getSchoolById, getSchoolsByKitchenId } from '../../db/queries.js';

export const LokasiPage: FC = () => {
  const kitchens = getKitchens() as any[];
  const schools = getSchools() as any[];
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

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
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">SLHS</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">Sekolah</th>
                  <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">Siswa</th>
                </tr>
              </thead>
              <tbody class="font-body-sm text-body-sm text-on-surface">
                {kitchens.map((kitchen: any, index: number) => {
                  const stats = kitchenStats.get(kitchen.name) || { schoolCount: 0, studentCount: 0 };
                  return (
                    <tr 
                      class={`border-b border-surface-variant/50 hover:bg-surface-container-lowest transition-colors cursor-pointer ${index >= INITIAL_LIMIT ? 'hidden kitchen-extra' : ''}`}
                      onclick={`document.getElementById('kitchen-modal-${kitchen.id}').classList.remove('hidden'); document.getElementById('kitchen-map-${kitchen.id}').src = document.getElementById('kitchen-map-${kitchen.id}').dataset.src;`}
                    >
                      <td class="py-4 px-4">
                        <div class="font-headline-sm text-headline-sm text-primary mb-1 hover:underline">{kitchen.name}</div>
                        <div class="text-on-surface-variant text-xs">{kitchen.code}</div>
                      </td>
                      <td class="py-4 px-4 text-on-surface-variant">{kitchen.city}, {kitchen.province}</td>
                      <td class="py-4 px-4 text-center">{kitchen.capacity.toLocaleString()}</td>
                      <td class="py-4 px-4 text-center">
                        <span class={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${kitchen.slhs ? 'bg-tertiary-container/10 text-tertiary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          {kitchen.slhs ? 'Ada' : 'Tidak Ada'}
                        </span>
                      </td>
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
                  class={`border-b border-surface-variant/50 hover:bg-surface-container-lowest transition-colors cursor-pointer ${index >= INITIAL_LIMIT ? 'hidden school-extra' : ''}`}
                  onclick={`document.getElementById('school-modal-${school.id}').classList.remove('hidden'); document.getElementById('school-map-${school.id}').src = document.getElementById('school-map-${school.id}').dataset.src;`}
                >
                  <td class="py-4 px-4">
                    <div class="font-headline-sm text-headline-sm text-primary hover:underline">{school.name}</div>
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

      {/* Kitchen Detail Modals */}
      {kitchens.map((kitchen: any) => {
        const kitchenSchools = getSchoolsByKitchenId(kitchen.id) as any[];
        const fullAddress = `${kitchen.address}, ${kitchen.village}, ${kitchen.district}, ${kitchen.city}, ${kitchen.province} ${kitchen.postal_code}`;
        const totalKitchenStudents = kitchenSchools.reduce((sum: number, s: any) => sum + s.student_count, 0);
        
        return (
          <div id={`kitchen-modal-${kitchen.id}`} class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
            <div class="bg-surface-container-lowest rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div class="sticky top-0 bg-surface-container-lowest p-card-padding border-b border-surface-variant flex justify-between items-center z-10">
                <h2 class="font-headline-md text-headline-md text-on-surface">Detail Dapur</h2>
                <button 
                  onclick={`document.getElementById('kitchen-modal-${kitchen.id}').classList.add('hidden')`}
                  class="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors"
                >
                  <span class="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
              
              {/* Modal Content */}
              <div class="p-card-padding">
                {/* Kitchen Info */}
                <div class="mb-6">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <h3 class="font-display-lg text-display-lg text-on-surface mb-2">{kitchen.name}</h3>
                      <div class="flex items-center gap-3 flex-wrap">
                        <span class={`px-3 py-1 rounded-full text-xs font-semibold ${kitchen.status === 'active' ? 'bg-tertiary-container/10 text-tertiary-container' : 'bg-error-container text-on-error-container'}`}>
                          {kitchen.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                        <span class={`px-3 py-1 rounded-full text-xs font-semibold ${kitchen.slhs ? 'bg-tertiary-container/10 text-tertiary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          SLHS: {kitchen.slhs ? 'Ada' : 'Tidak Ada'}
                        </span>
                        <span class="text-on-surface-variant font-body-sm text-body-sm">Kode: {kitchen.code}</span>
                      </div>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined">restaurant</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div class="grid grid-cols-3 gap-4 mb-6">
                  <div class="bg-surface-bright rounded-lg p-4 text-center">
                    <p class="font-label-md text-label-md text-on-surface-variant mb-1">Kapasitas</p>
                    <p class="font-headline-sm text-headline-sm text-on-surface">{kitchen.capacity.toLocaleString()}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">porsi/hari</p>
                  </div>
                  <div class="bg-surface-bright rounded-lg p-4 text-center">
                    <p class="font-label-md text-label-md text-on-surface-variant mb-1">Sekolah</p>
                    <p class="font-headline-sm text-headline-sm text-on-surface">{kitchenSchools.length}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">sekolah</p>
                  </div>
                  <div class="bg-surface-bright rounded-lg p-4 text-center">
                    <p class="font-label-md text-label-md text-on-surface-variant mb-1">Siswa</p>
                    <p class="font-headline-sm text-headline-sm text-on-surface">{totalKitchenStudents.toLocaleString()}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">siswa</p>
                  </div>
                </div>

                {/* Address */}
                <div class="mb-6">
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-on-surface-variant mt-0.5">location_on</span>
                    <div>
                      <p class="font-label-md text-label-md text-on-surface-variant mb-1">Alamat</p>
                      <p class="font-body-md text-body-md text-on-surface">{fullAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Google Maps */}
                <div class="mb-6 rounded-lg overflow-hidden border border-surface-variant">
                  <div class="w-full h-48">
                    {mapsApiKey ? (
                      <iframe
                        id={`kitchen-map-${kitchen.id}`}
                        width="100%"
                        height="100%"
                        style="border:0"
                        loading="lazy"
                        data-src={`https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(fullAddress)}`}
                        src="about:blank"
                      ></iframe>
                    ) : (
                      <div class="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant">
                        <span class="material-symbols-outlined text-4xl mb-2">map</span>
                        <p class="font-body-sm text-body-sm">Google Maps tidak tersedia</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schools List */}
                {kitchenSchools.length > 0 && (
                  <div>
                    <h4 class="font-headline-sm text-headline-sm text-on-surface mb-3">Sekolah yang Dilayani</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                      {kitchenSchools.map((school: any) => (
                        <div class="flex items-center justify-between p-3 bg-surface-bright rounded-lg">
                          <div>
                            <p class="font-body-md text-body-md text-on-surface font-medium">{school.name}</p>
                            <p class="font-body-sm text-body-sm text-on-surface-variant">{school.student_count.toLocaleString()} siswa</p>
                          </div>
                          <button 
                            onclick={`document.getElementById('kitchen-modal-${kitchen.id}').classList.add('hidden'); document.getElementById('school-modal-${school.id}').classList.remove('hidden'); document.getElementById('school-map-${school.id}').src = document.getElementById('school-map-${school.id}').dataset.src;`}
                            class="text-primary hover:bg-primary-container hover:text-on-primary-container p-2 rounded-full transition-colors"
                          >
                            <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* School Detail Modals */}
      {schools.map((school: any) => {
        const fullAddress = `${school.address}, ${school.village}, ${school.district}, ${school.city}, ${school.province} ${school.postal_code}`;
        
        return (
          <div id={`school-modal-${school.id}`} class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
            <div class="bg-surface-container-lowest rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div class="sticky top-0 bg-surface-container-lowest p-card-padding border-b border-surface-variant flex justify-between items-center z-10">
                <h2 class="font-headline-md text-headline-md text-on-surface">Detail Sekolah</h2>
                <button 
                  onclick={`document.getElementById('school-modal-${school.id}').classList.add('hidden')`}
                  class="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors"
                >
                  <span class="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
              
              {/* Modal Content */}
              <div class="p-card-padding">
                {/* School Info */}
                <div class="mb-6">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <h3 class="font-display-lg text-display-lg text-on-surface mb-2">{school.name}</h3>
                      <div class="flex items-center gap-3 flex-wrap">
                        <span class={`px-3 py-1 rounded-full text-xs font-semibold ${school.status === 'active' ? 'bg-tertiary-container/10 text-tertiary-container' : 'bg-error-container text-on-error-container'}`}>
                          {school.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                        <span class="text-on-surface-variant font-body-sm text-body-sm">NPSN: {school.npsn}</span>
                      </div>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                      <span class="material-symbols-outlined">school</span>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-on-surface-variant mt-0.5">group</span>
                    <div>
                      <p class="font-label-md text-label-md text-on-surface-variant mb-1">Jumlah Siswa</p>
                      <p class="font-body-md text-body-md text-on-surface">{school.student_count.toLocaleString()} siswa</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-on-surface-variant mt-0.5">restaurant</span>
                    <div>
                      <p class="font-label-md text-label-md text-on-surface-variant mb-1">Dapur MBG</p>
                      <p class="font-body-md text-body-md text-primary">{school.kitchen_name}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div class="mb-6">
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-on-surface-variant mt-0.5">location_on</span>
                    <div>
                      <p class="font-label-md text-label-md text-on-surface-variant mb-1">Alamat</p>
                      <p class="font-body-md text-body-md text-on-surface">{fullAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Google Maps */}
                <div class="rounded-lg overflow-hidden border border-surface-variant">
                  <div class="w-full h-48">
                    {mapsApiKey ? (
                      <iframe
                        id={`school-map-${school.id}`}
                        width="100%"
                        height="100%"
                        style="border:0"
                        loading="lazy"
                        data-src={`https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(fullAddress)}`}
                        src="about:blank"
                      ></iframe>
                    ) : (
                      <div class="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant">
                        <span class="material-symbols-outlined text-4xl mb-2">map</span>
                        <p class="font-body-sm text-body-sm">Google Maps tidak tersedia</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </AdminLayout>
  );
};
