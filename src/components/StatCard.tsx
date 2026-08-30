import type { FC, Child } from 'hono/jsx';

interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  valueId?: string;
  badge?: Child;
}

export const StatCard: FC<StatCardProps> = ({ icon, iconColor, iconBg, label, value, valueId, badge }) => {
  return (
    <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-transparent hover:border-primary transition-all duration-300">
      <div class="flex justify-between items-start mb-4">
        <div class={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
          <span class="material-symbols-outlined">{icon}</span>
        </div>
        {badge}
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">{label}</p>
      <h3 id={valueId} class="font-display-lg text-display-lg text-on-surface">{value}</h3>
    </div>
  );
};
