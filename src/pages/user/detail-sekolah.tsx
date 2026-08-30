import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { getSchoolById } from '../../db/queries.js';

interface DetailSekolahPageProps {
  id: string;
}

export const DetailSekolahPage: FC<DetailSekolahPageProps> = ({ id }) => {
  const school = getSchoolById(Number(id)) as any;

  if (!school) {
    return (
      <AdminLayout title="Sekolah Tidak Ditemukan" activePage="/lokasi" variant="user">
        <div class="max-w-4xl mx-auto">
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding text-center">
            <span class="material-symbols-outlined text-6xl text-on-surface-variant mb-4">error_outline</span>
            <h2 class="font-headline-md text-headline-md text-on-surface mb-2">Sekolah Tidak Ditemukan</h2>
            <p class="font-body-md text-body-md text-on-surface-variant mb-6">Data sekolah dengan ID tersebut tidak tersedia.</p>
            <a href="/lokasi" class="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Daftar Lokasi
            </a>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const fullAddress = `${school.address}, ${school.village}, ${school.district}, ${school.city}, ${school.province} ${school.postal_code}`;
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

  return (
    <AdminLayout title={`Detail Sekolah - ${school.name}`} activePage="/lokasi" variant="user">
      <div class="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div class="mb-6 flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <a href="/lokasi" class="hover:text-primary transition-colors">Lokasi & Sekolah</a>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          <span class="text-on-surface">{school.name}</span>
        </div>

        {/* Header Card */}
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding mb-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="font-display-lg text-display-lg text-on-surface mb-2">{school.name}</h1>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* School Info */}
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding">
            <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4">Informasi Sekolah</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-on-surface-variant mt-0.5">location_on</span>
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">Alamat Lengkap</p>
                  <p class="font-body-md text-body-md text-on-surface">{fullAddress}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-on-surface-variant mt-0.5">group</span>
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">Jumlah Siswa</p>
                  <p class="font-body-md text-body-md text-on-surface">{school.student_count.toLocaleString()} siswa</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-on-surface-variant mt-0.5">badge</span>
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">NPSN</p>
                  <p class="font-body-md text-body-md text-on-surface font-mono">{school.npsn}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kitchen Info */}
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding">
            <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4">Dapur MBG yang Melayani</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-on-surface-variant mt-0.5">restaurant</span>
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">Nama Dapur</p>
                  <a href={`/lokasi/dapur/${school.kitchen_id}`} class="font-body-md text-body-md text-primary hover:underline">{school.kitchen_name}</a>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-on-surface-variant mt-0.5">qr_code</span>
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">Kode Dapur</p>
                  <p class="font-body-md text-body-md text-on-surface font-mono">{school.kitchen_code}</p>
                </div>
              </div>
              <a href={`/lokasi/dapur/${school.kitchen_id}`} class="inline-flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-primary-fixed/50 px-4 py-2 rounded-full transition-colors">
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                Lihat Detail Dapur
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
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
