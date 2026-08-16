'use client';

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Rounded focus-visible ring via box-shadow rather than the native outline —
 * the native outline is square and sits outside these rounded/pill
 * containers, which reads as a stray double border. globals.css turns the
 * native outline off for form elements to match.
 */
const RING = 'focus-visible:ring-2 focus-visible:ring-violet-ink-2';

const fieldClasses = cn(
  'w-full rounded-xl border border-line-3 bg-surface-input px-3.5 py-3 text-sm text-text',
  'placeholder:text-muted-3 outline-none transition-colors focus:border-violet-ink-2',
  RING,
);

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-ink">{error}</span> : null}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
}

export function Input({ icon, trailing, invalid, className, ...props }: InputProps) {
  if (!icon && !trailing) {
    return <input className={cn(fieldClasses, invalid && 'border-red-ink', className)} {...props} />;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl border bg-surface-input px-3.5',
        'transition-colors focus-within:border-violet-ink-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-ink-2',
        invalid ? 'border-red-ink' : 'border-line-3',
      )}
    >
      {icon ? <span className="text-muted-3">{icon}</span> : null}
      <input
        className={cn('flex-1 bg-transparent py-3 text-sm text-text outline-none placeholder:text-muted-3', className)}
        {...props}
      />
      {trailing}
    </div>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, 'resize-none', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClasses, 'appearance-none', className)} {...props}>
      {children}
    </select>
  );
}
