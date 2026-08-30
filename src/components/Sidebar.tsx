import type { FC } from 'hono/jsx';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface SidebarProps {
  activePage: string;
  variant?: 'admin' | 'user';
}

const adminNavItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/admin' },
  { icon: 'payments', label: 'Keuangan', href: '/admin/keuangan' },
  { icon: 'restaurant', label: 'Menu & Gizi', href: '/admin/menu' },
  { icon: 'assessment', label: 'Laporan', href: '/admin/aspirasi' },
  { icon: 'location_on', label: 'Dapur & Sekolah', href: '/admin/lokasi' },
];

const userNavItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/' },
  { icon: 'payments', label: 'Keuangan', href: '/keuangan' },
  { icon: 'restaurant', label: 'Menu & Gizi', href: '/menu' },
  { icon: 'assessment', label: 'Laporan', href: '/laporan' },
];

export const Sidebar: FC<SidebarProps> = ({ activePage, variant = 'admin' }) => {
  const items = variant === 'admin' ? adminNavItems : userNavItems;
  const subtitle = variant === 'admin' ? 'Admin Dashboard' : 'Admin Portal';

  return (
    <aside
      class="fixed left-0 top-0 h-full w-[240px] bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] z-20 flex flex-col py-container-margin px-stack-md hidden md:flex"
      id="sidebar"
    >
      <div class="mb-8 px-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
          M
        </div>
        <div>
          <h1 class="font-headline-md text-headline-md font-bold text-primary">MBG Transparansi</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <nav class="flex-1 flex flex-col gap-2">
        {items.map((item) => {
          const isActive = item.href === activePage;
          const activeClass = isActive
            ? 'bg-primary-container text-on-primary-container'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary';
          const fillAttr = isActive ? "font-variation-settings: 'FILL' 1;" : '';
          const fontWeight = isActive ? 'font-bold' : '';

          return (
            <a
              class={`${activeClass} rounded-full px-4 py-2 flex items-center gap-3 transition-all duration-200 ease-in-out scale-95 hover:scale-100 active:scale-100`}
              href={item.href}
            >
              <span class="material-symbols-outlined" style={fillAttr}>{item.icon}</span>
              <span class={`font-label-md text-label-md ${fontWeight}`}>{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div class="mt-auto border-t border-surface-variant pt-4 px-4">
        <form action="/logout" method="post">
          <button
            type="submit"
            class="w-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary rounded-full px-4 py-2 flex items-center gap-3 transition-colors"
          >
            <span class="material-symbols-outlined">logout</span>
            <span class="font-label-md text-label-md">Keluar</span>
          </button>
        </form>
      </div>
    </aside>
  );
};
