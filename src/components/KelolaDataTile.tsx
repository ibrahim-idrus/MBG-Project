import type { FC } from 'hono/jsx';

interface KelolaDataTileProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  href: string;
}

export const KelolaDataTile: FC<KelolaDataTileProps> = ({ icon, iconColor, iconBg, title, description, href }) => {
  return (
    <a
      href={href}
      class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary/20 transition-all duration-300 cursor-pointer group block"
    >
      <div class={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor} mb-4 group-hover:scale-110 transition-transform`}>
        <span class="material-symbols-outlined">{icon}</span>
      </div>
      <h3 class="font-headline-sm text-headline-sm text-on-surface mb-1">{title}</h3>
      <p class="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
    </a>
  );
};
