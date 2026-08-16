import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Logo';

const POINTS = [
  { label: 'Flexible tasks that fit any day of the week', color: 'var(--cyan-ink)' },
  { label: 'A coach and a fitness assistant in your chats', color: 'var(--violet-ink)' },
  { label: 'Share your board one way, on your terms', color: 'var(--pink-ink)' },
];

/** The marketing panel beside the auth forms. Hidden below lg. */
export function AuthHero() {
  return (
    <aside
      className="hidden w-[43%] max-w-xl flex-col justify-between p-12 lg:flex"
      style={{ background: 'linear-gradient(160deg, var(--hero-1), var(--hero-2))' }}
    >
      <Link href="/" className="w-fit">
        <Wordmark size={36} />
      </Link>

      <div className="flex flex-col gap-7">
        <h1 className="font-display text-5xl leading-[1.05] font-bold tracking-tight">
          Plan the day you actually want to live.
        </h1>
        <p className="max-w-sm text-[15px] leading-relaxed text-muted">
          Timed activities, flexible tasks with no fixed day, meals from the foods you have, and a coach
          who nudges — all on one board.
        </p>

        <ul className="flex flex-col gap-3.5">
          {POINTS.map((point) => (
            <li key={point.label} className="flex items-center gap-3 text-sm font-semibold text-text-2">
              <CheckCircle2 size={19} style={{ color: point.color }} />
              {point.label}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs font-medium text-muted-3">Your board stays private until you share it.</p>
    </aside>
  );
}
