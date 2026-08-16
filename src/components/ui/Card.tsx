import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  dashed?: boolean;
}

export function Card({ children, className, style, dashed = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5',
        dashed ? 'border-dashed border-line-dash' : 'border-line-2 bg-surface-2',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">{children}</div>
  );
}
