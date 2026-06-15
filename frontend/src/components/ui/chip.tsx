import { cn } from '@/lib/cn';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

/** Filter chip (.chip / .chip.on) — pill, accent tint when active. */
export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'font-ui text-[12.5px] rounded-full px-3 py-[5px] border transition-all duration-150',
        'whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer',
        active
          ? 'bg-accent-tint text-accent-deep border-accent-line font-semibold'
          : 'bg-surface text-ink-2 border-line-2 hover:border-ink-3',
      )}
    >
      {label}
    </button>
  );
}
