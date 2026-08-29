import type { FC } from 'hono/jsx';

interface HeaderProps {
  title: string;
}

export const Header: FC<HeaderProps> = ({ title }) => {
  return (
    <header class="bg-surface shadow-sm h-16 px-gutter flex justify-between items-center sticky top-0 z-10 w-full">
      <div class="flex items-center gap-4">
        <button
          class="md:hidden text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-70"
          onclick="document.getElementById('sidebar').classList.toggle('-translate-x-full'); document.getElementById('sidebar').classList.toggle('translate-x-0')"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>
        <h2 class="font-headline-md text-headline-md-mobile md:text-headline-md font-bold text-primary">{title}</h2>
      </div>
      <div class="flex items-center gap-4">
        <button class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-70 p-2 rounded-full hover:bg-surface-container-high">
          <span class="material-symbols-outlined">calendar_month</span>
        </button>
        <button class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-70 p-2 rounded-full hover:bg-surface-container-high relative">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant cursor-pointer ml-2">
          <div class="w-full h-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span class="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
