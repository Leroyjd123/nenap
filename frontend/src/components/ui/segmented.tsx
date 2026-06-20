import { cn } from '@/lib/cn';

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  block?: boolean;
}

/** Segmented control (.seg) — e.g. Enhanced / Original / Transcript. */
export function Segmented<T extends string>({ options, value, onChange, block }: SegmentedProps<T>) {
  return (
    <div className={cn('bg-surface-3 rounded-sm p-[3px] gap-[2px]', block ? 'flex' : 'inline-flex')}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'text-[13px] font-semibold px-[13px] py-1.5 rounded-[calc(var(--r-sm)-2px)]',
            'transition-all duration-150 whitespace-nowrap cursor-pointer',
            block && 'flex-1 text-center',
            value === opt.value ? 'bg-surface text-ink shadow-1' : 'text-ink-2',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
