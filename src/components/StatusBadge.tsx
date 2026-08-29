import type { FC } from 'hono/jsx';

type BadgeVariant = 'masuk' | 'keluar' | 'pending' | 'proses' | 'selesai' | 'ditolak' | 'aktif' | 'updated' | 'baru' | 'diperiksa';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  showDot?: boolean;
}

const badgeStyles: Record<BadgeVariant, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  masuk: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed-variant', dot: 'bg-tertiary', defaultLabel: 'Masuk' },
  keluar: { bg: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error', defaultLabel: 'Keluar' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-600', defaultLabel: 'Pending' },
  proses: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-600', defaultLabel: 'Proses' },
  selesai: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-600', defaultLabel: 'Selesai' },
  ditolak: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-600', defaultLabel: 'Ditolak' },
  aktif: { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', dot: 'bg-on-tertiary-container', defaultLabel: 'Aktif' },
  updated: { bg: 'bg-tertiary-container/10', text: 'text-tertiary-container', dot: 'bg-tertiary-container', defaultLabel: 'UPDATED' },
  baru: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-600', defaultLabel: 'Baru' },
  diperiksa: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-600', defaultLabel: 'Diperiksa' },
};

export const StatusBadge: FC<StatusBadgeProps> = ({ variant, label, showDot = true }) => {
  const style = badgeStyles[variant];
  const icon = variant === 'masuk' ? 'arrow_upward' : variant === 'keluar' ? 'arrow_downward' : null;

  return (
    <span class={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${style.bg} ${style.text} text-xs font-semibold`}>
      {showDot && <span class={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>}
      {icon && <span class="material-symbols-outlined text-[12px]">{icon}</span>}
      {label || style.defaultLabel}
    </span>
  );
};
