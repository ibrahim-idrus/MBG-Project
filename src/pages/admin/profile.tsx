import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { StatusBadge } from '../../components/StatusBadge.js';

export interface AdminProfileKitchen {
  id: number;
  name: string;
  code: string;
  city: string;
  province: string;
  status: string;
  schools: Array<{
    id: number;
    name: string;
    npsn: string;
    student_count: number;
    status: string;
  }>;
}

export interface AdminProfileProps {
  admin: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'super_admin';
  };
  kitchens: AdminProfileKitchen[];
  totalSchools: number;
  totalStudents: number;
}

const roleLabel = (role: 'admin' | 'super_admin') =>
  role === 'super_admin' ? 'Super Admin' : 'Admin';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);

export const AdminProfilePage: FC<AdminProfileProps> = ({ admin, kitchens, totalSchools, totalStudents }) => {
  return (
    <AdminLayout title="Profil Admin" activePage="/admin/profile">
      <div class="mb-8">
        <h2 class="font-display-lg text-display-lg font-bold text-on-surface">Profil Admin</h2>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">
          Informasi akun dan dapur MBG yang Anda kelola.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
        <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant p-card-padding">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl shrink-0">
              {initials(admin.name) || 'A'}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-headline-md text-headline-md text-on-surface truncate">{admin.name}</h3>
              <p class="font-body-md text-body-md text-on-surface-variant truncate">{admin.email}</p>
              <div class="mt-3 inline-flex">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-semibold">
                  <span class="material-symbols-outlined" style="font-size: 14px;">verified_user</span>
                  {roleLabel(admin.role)}
                </span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-surface-variant">
            <div>
              <div class="text-xs text-on-surface-variant">Dapur Dikelola</div>
              <div class="font-headline-md text-headline-md text-on-surface mt-1">{kitchens.length}</div>
            </div>
            <div>
              <div class="text-xs text-on-surface-variant">Total Sekolah</div>
              <div class="font-headline-md text-headline-md text-on-surface mt-1">{totalSchools.toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>

        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant p-card-padding">
          <h3 class="font-headline-md text-headline-md text-on-surface mb-4">Ringkasan</h3>
          <ul class="space-y-3">
            <li class="flex items-center justify-between">
              <span class="font-body-md text-body-md text-on-surface-variant">Total siswa dilayani</span>
              <span class="font-label-lg text-label-lg text-on-surface">{totalStudents.toLocaleString('id-ID')}</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="font-body-md text-body-md text-on-surface-variant">Dapur aktif</span>
              <span class="font-label-lg text-label-lg text-on-surface">
                {kitchens.filter((k) => k.status === 'active').length}
              </span>
            </li>
            <li class="flex items-center justify-between">
              <span class="font-body-md text-body-md text-on-surface-variant">Sekolah aktif</span>
              <span class="font-label-lg text-label-lg text-on-surface">
                {kitchens.flatMap((k) => k.schools).filter((s) => s.status === 'active').length}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex items-baseline justify-between">
          <h3 class="font-headline-md text-headline-md text-on-surface">Dapur MBG &amp; Sekolah</h3>
          <span class="font-body-sm text-body-sm text-on-surface-variant">
            {kitchens.length} dapur &middot; {totalSchools} sekolah
          </span>
        </div>

        {kitchens.length === 0 ? (
          <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-card-padding text-center">
            <span class="material-symbols-outlined text-outline text-4xl">domain_disabled</span>
            <p class="font-body-md text-body-md text-on-surface-variant mt-2">
              Anda belum ditugaskan ke dapur MBG manapun. Hubungi super admin untuk penugasan.
            </p>
          </div>
        ) : (
          kitchens.map((kitchen) => (
            <section
              key={kitchen.id}
              class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden"
            >
              <div class="p-card-padding border-b border-surface-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div class="flex items-start gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                    <span class="material-symbols-outlined">domain</span>
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-headline-sm text-headline-sm text-on-surface truncate">{kitchen.name}</h4>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">
                      {kitchen.city}, {kitchen.province} &middot; {kitchen.code}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-semibold">
                    <span class="material-symbols-outlined" style="font-size: 14px;">school</span>
                    {kitchen.schools.length} sekolah
                  </span>
                  <StatusBadge variant={kitchen.status === 'active' ? 'aktif' : 'diperiksa'} label={kitchen.status === 'active' ? 'Aktif' : kitchen.status} />
                </div>
              </div>

              {kitchen.schools.length === 0 ? (
                <div class="p-6 text-center text-on-surface-variant">
                  <p class="font-body-sm text-body-sm">Dapur ini belum memiliki sekolah terhubung.</p>
                </div>
              ) : (
                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead class="bg-surface-container-low">
                      <tr>
                        <th class="p-3">Sekolah</th>
                        <th class="p-3">NPSN</th>
                        <th class="p-3 text-right">Siswa</th>
                        <th class="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kitchen.schools.map((school) => (
                        <tr key={school.id} class="border-b border-surface-variant last:border-b-0 hover:bg-surface-container-low">
                          <td class="p-3">
                            <div class="font-semibold text-on-surface">{school.name}</div>
                          </td>
                          <td class="p-3 font-body-md text-body-md text-on-surface-variant">{school.npsn}</td>
                          <td class="p-3 text-right font-label-md text-label-md text-on-surface">
                            {school.student_count.toLocaleString('id-ID')}
                          </td>
                          <td class="p-3">
                            <StatusBadge
                              variant={school.status === 'active' ? 'aktif' : 'diperiksa'}
                              label={school.status === 'active' ? 'Aktif' : school.status}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </AdminLayout>
  );
};
