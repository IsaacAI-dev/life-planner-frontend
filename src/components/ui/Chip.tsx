'use client';

import { cn, withAlpha } from '@/lib/utils';

interface ChipProps {
  label: string;
  color?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, color, selected = false, onClick, className }: ChipProps) {
  const Element = onClick ? 'button' : 'span';

  return (
    <Element
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
        selected ? 'text-text' : 'border-line-2 bg-surface-4 text-muted',
        className,
      )}
      style={
        selected && color
          ? { borderColor: color, background: withAlpha(color, 0.16), color }
          : undefined
      }
    >
      {color ? <span className="size-2 rounded-full" style={{ background: color }} /> : null}
      {label}
    </Element>
  );
}
