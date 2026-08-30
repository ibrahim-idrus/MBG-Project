import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { getKitchenById, getSchoolsByKitchenId } from '../../db/queries.js';

interface DetailDapurPageProps {
  id: string;
}

export const DetailDapurPage: FC<DetailDapurPageProps> = ({ id }) => {
  const kitchen = getKitchenById(Number(id)) as any;
  const schools = kitchen ? getSchoolsByKitchenId(kitchen.id) as any[] : [];

  if (!kitchen) {
    return (
      <AdminLayout title="Dapur Tidak Ditemukan" activePage="/lokasi" variant="user">
        <div class="max-w-4xl mx-auto">
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding text-center">
            <span class="material-symbols-outlined text-6xl text-on-surface-variant mb-4">error_outline</span>
            <h2 class="font-headline-md text-headline-md text-on-surface mb-2">Dapur Tidak Ditemukan</h2>
            <p class="font-body-md text-body-md text-on-surface-variant mb-6">Data dapur dengan ID tersebut tidak tersedia.</p>
            <a href="/lokasi" class="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Daftar Lokasi
            </a>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const fullAddress = `${kitchen.address}, ${kitchen.village}, ${kitchen.district}, ${kitchen.city}, ${kitchen.province} ${kitchen.postal_code}`;
  const totalStudents = schools.reduce((sum: number, s: any) => sum + s.student_count, 0);
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

  return (
    <AdminLayout title={`Detail Dapur - ${kitchen.name}`} activePage="/lokasi" variant="user">
      <div class="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div class="mb-6 flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <a href="/lokasi" class="hover:text-primary transition-colors">Lokasi & Sekolah</a>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          <span class="text-on-surface">{kitchen.name}</span>
        </div>

        {/* Header Card */}
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding mb-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="font-display-lg text-display-lg text-on-surface mb-2">{kitchen.name}</h1>
              <div class="flex items-center gap-3 flex-wrap">
                <span class={`px-3 py-1 rounded-full text-xs font-semibold ${kitchen.status === 'active' ? 'bg-tertiary-container/10 text-tertiary-container' : 'bg-error-container text-on-error-container'}`}>
                  {kitchen.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
                <span class="text-on-surface-variant font-body-sm text-body-sm">Kode: {kitchen.code}</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span class="material-symbols-outlined">restaurant</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding text-center">
            <div class="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary mx-auto mb-3">
              <span class="material-symbols-outlined">speed</span>
            </div>
            <p class="font-label-md text-label-md text-on-surface-variant mb-1">Kapasitas</p>
            <p class="font-headline-md text-headline-md text-on-surface">{kitchen.capacity.toLocaleString()}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant">porsi/hari</p>
          </div>
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding text-center">
            <div class="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary mx-auto mb-3">
              <span class="material-symbols-outlined">school</span>
            </div>
            <p class="font-label-md text-label-md text-on-surface-variant mb-1">Sekolah Dilayani</p>
            <p class="font-headline-md text-headline-md text-on-surface">{schools.length}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant">sekolah</p>
          </div>
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding text-center">
            <div class="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary mx-auto mb-3">
              <span class="material-symbols-outlined">group</span>
            </div>
            <p class="font-label-md text-label-md text-on-surface-variant mb-1">Total Siswa</p>
            <p class="font-headline-md text-headline-md text-on-surface">{totalStudents.toLocaleString()}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant">siswa</p>
          </div>
        </div>

        {/* Kitchen Info */}
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding mb-6">
          <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4">Informasi Dapur</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-on-surface-variant mt-0.5">location_on</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface-variant mb-1">Alamat Lengkap</p>
                <p class="font-body-md text-body-md text-on-surface">{fullAddress}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-on-surface-variant mt-0.5">qr_code</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface-variant mb-1">Kode Dapur</p>
                <p class="font-body-md text-body-md text-on-surface font-mono">{kitchen.code}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-on-surface-variant mt-0.5">location_city</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface-variant mb-1">Wilayah</p>
                <p class="font-body-md text-body-md text-on-surface">{kitchen.city}, {kitchen.province}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-on-surface-variant mt-0.5">mail</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface-variant mb-1">Kode Pos</p>
                <p class="font-body-md text-body-md text-on-surface">{kitchen.postal_code}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden mb-6">
          <div class="p-card-padding border-b border-surface-variant">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Lokasi di Peta</h3>
          </div>
          <div class="w-full h-80 md:h-96">
            {mapsApiKey ? (
              <iframe
                width="100%"
                height="100%"
                style="border:0"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(fullAddress)}`}
              ></iframe>
            ) : (
              <div class="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant">
                <span class="material-symbols-outlined text-5xl mb-3">map</span>
                <p class="font-body-md text-body-md">Google Maps tidak tersedia</p>
                <p class="font-body-sm text-body-sm mt-1">API key tidak dikonfigurasi</p>
              </div>
            )}
          </div>
          <div class="p-4 bg-surface-bright flex justify-between items-center">
            <span class="font-body-sm text-body-sm text-on-surface-variant">{fullAddress}</span>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-primary-fixed/50 px-4 py-2 rounded-full transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">open_in_new</span>
              Buka di Maps
            </a>
          </div>
        </div>

        {/* Schools List */}
        {schools.length > 0 && (
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden mb-6">
            <div class="p-card-padding border-b border-surface-variant flex justify-between items-center">
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Sekolah yang Dilayani</h3>
              <span class="text-on-surface-variant font-body-sm text-body-sm">{schools.length} sekolah</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-surface-container-low border-b border-surface-variant">
                  <tr>
                    <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Nama Sekolah</th>
                    <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant">NPSN</th>
                    <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">Siswa</th>
                    <th class="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-center">Status</th>
                    <th class="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody class="font-body-sm text-body-sm text-on-surface">
                  {schools.map((school: any) => (
                    <tr class="border-b border-surface-variant/50 hover:bg-surface-container-lowest transition-colors">
                      <td class="py-4 px-4">
                        <div class="font-headline-sm text-headline-sm text-on-surface">{school.name}</div>
                        <div class="text-on-surface-variant text-xs truncate max-w-xs">{school.address}</div>
                      </td>
                      <td class="py-4 px-4 text-on-surface-variant font-mono text-xs">{school.npsn}</td>
                      <td class="py-4 px-4 text-right font-medium">{school.student_count.toLocaleString()}</td>
                      <td class="py-4 px-4 text-center">
                        <span class={`px-2 py-1 rounded-full text-xs font-semibold ${school.status === 'active' ? 'bg-tertiary-container/10 text-tertiary-container' : 'bg-error-container text-on-error-container'}`}>
                          {school.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td class="py-4 px-4 text-right">
                        <a href={`/lokasi/sekolah/${school.id}`} class="text-primary hover:bg-primary-container hover:text-on-primary-container p-2 rounded-full transition-colors inline-flex">
                          <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div class="mt-6 flex justify-start">
          <a href="/lokasi" class="inline-flex items-center gap-2 bg-surface-container-lowest text-on-surface px-6 py-2.5 rounded-full font-label-md text-label-md border border-outline-variant hover:bg-surface-container-low transition-colors">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali ke Daftar Lokasi
          </a>
        </div>
      </div>
    </AdminLayout>
  );
};
