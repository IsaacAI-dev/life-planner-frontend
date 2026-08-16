import { LogoMark } from '@/components/brand/Logo';

export function BootScreen() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ background: 'var(--app-bg)' }}
    >
      <LogoMark size={54} className="animate-breathe-dawn rounded-2xl" />
      <div className="font-display text-base font-semibold tracking-tight">Life Planner</div>
      <div className="relative h-[3px] w-44 overflow-hidden rounded-full bg-surface-4">
        <div
          className="animate-railslide absolute inset-y-0 w-[42%] rounded-full"
          style={{ background: 'linear-gradient(90deg,#F472B6,#A78BFA 50%,#34DDE0)' }}
        />
      </div>
      <div className="text-[12.5px] font-medium text-muted-2">Syncing your plan…</div>
    </div>
  );
}
