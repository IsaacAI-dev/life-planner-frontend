'use client';

const SEAT_WORDS: Record<number, string> = { 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five' };

export function seatLabel(count: number): string {
  if (count === 1) return 'Just me';
  return `${SEAT_WORDS[count] ?? count} of us`;
}

interface SeatSelectorProps {
  /** The ceiling comes from the catalog, so it is never hardcoded. */
  maxSeats: number;
  value: number;
  onChange: (seats: number) => void;
}

export function SeatSelector({ maxSeats, value, onChange }: SeatSelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {Array.from({ length: maxSeats }, (_, index) => index + 1).map((count) => (
        <button
          key={count}
          type="button"
          onClick={() => onChange(count)}
          className="rounded-xl border px-3 py-2.5 text-sm font-bold"
          style={{
            borderColor: value === count ? 'var(--violet-ink-2)' : 'var(--line-2)',
            background: value === count ? 'var(--surface-4)' : 'transparent',
            color: value === count ? 'var(--text)' : 'var(--muted)',
          }}
        >
          {seatLabel(count)}
        </button>
      ))}
    </div>
  );
}
