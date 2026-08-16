'use client';

import { cn } from '@/lib/utils';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('inline-flex rounded-xl border border-line-2 bg-surface-2 p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-xs font-bold transition-colors',
            value === option.value ? 'bg-accent text-on-accent' : 'text-muted',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
