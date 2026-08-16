interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

export function Progress({ value, max = 100, color, className }: ProgressProps) {
  const percent = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-4 ${className ?? ''}`}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${percent}%`, background: color ?? 'var(--accent)' }}
      />
    </div>
  );
}
