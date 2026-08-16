'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  error?: string | null;
}

export function Checkbox({ checked, onChange, label, error }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex items-start gap-2.5 text-left"
      >
        <span
          className="mt-0.5 flex size-4.5 flex-none items-center justify-center rounded-md border-2 transition-colors"
          style={{
            borderColor: error ? 'var(--red-ink)' : checked ? 'var(--violet-ink)' : 'var(--line-strong)',
            background: checked ? 'var(--violet-ink)' : 'transparent',
          }}
        >
          {checked ? <Check size={12} strokeWidth={3} className="text-on-accent" /> : null}
        </span>
        <span className="text-xs leading-relaxed text-muted">{label}</span>
      </button>
      {error ? <span className="pl-7 text-xs font-semibold text-red-ink">{error}</span> : null}
    </div>
  );
}
