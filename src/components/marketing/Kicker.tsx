export function Kicker({ children }: { children: string }) {
  return (
    <span
      className="inline-flex w-fit items-center gap-2.5 text-xs font-bold tracking-[0.13em] uppercase"
      style={{ color: 'var(--lp-ac)' }}
    >
      <span className="h-0.5 w-6" style={{ background: 'var(--lp-ac)' }} />
      {children}
    </span>
  );
}
