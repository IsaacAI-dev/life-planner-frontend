'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 flex-none rounded-full transition-colors"
      style={{ background: checked ? 'var(--accent)' : 'var(--surface-4)' }}
    >
      <span
        className="absolute top-1 size-5 rounded-full bg-white transition-[left] duration-200"
        style={{ left: checked ? 26 : 4 }}
      />
    </button>
  );
}
