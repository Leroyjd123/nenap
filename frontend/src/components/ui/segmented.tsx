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
    <div className={cn('seg', block && 'block')}>
      {options.map((opt) => (
        <span
          key={opt.value}
          className={value === opt.value ? 'on' : ''}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </span>
      ))}
    </div>
  );
}
