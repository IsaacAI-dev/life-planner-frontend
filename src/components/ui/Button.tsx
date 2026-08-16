'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'accent' | 'solid' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-5 py-3 text-base gap-2 rounded-xl',
};

export function Button({
  variant = 'solid',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants: Record<Variant, string> = {
    accent: 'bg-accent text-on-accent shadow-[0_8px_24px_rgba(167,139,250,0.35)]',
    solid: 'bg-surface-4 text-text-2 border border-line-2',
    outline: 'bg-transparent text-text-2 border border-line-strong',
    ghost: 'bg-transparent text-muted hover:text-text-2',
    danger: 'bg-transparent text-red-ink border border-red-ink/40',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold transition-opacity',
        'disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90',
        sizes[size],
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
