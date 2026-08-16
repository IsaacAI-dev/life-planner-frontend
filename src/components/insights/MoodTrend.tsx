'use client';

import { format, parseISO } from 'date-fns';
import { MOOD_LABELS } from '@/lib/constants';
import type { MoodSeries } from '@/lib/types';

const MOOD_COLORS: Record<number, string> = {
  1: 'var(--red-ink)',
  2: 'var(--orange-ink)',
  3: 'var(--amber-ink)',
  4: 'var(--cyan-ink)',
  5: 'var(--green-ink)',
};

/**
 * The series is sparse — only days with a logged mood come back — so each bar is
 * a day that was actually recorded rather than a slot on a fixed axis.
 */
export function MoodTrend({ series }: { series?: MoodSeries }) {
  const recorded = series?.points ?? [];

  if (!recorded.length) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Add a mood to your day note and the trend will build up here.
      </p>
    );
  }

  const average = series?.average ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-1.5" style={{ height: 96 }}>
        {recorded.map((point) => (
          <div key={point.date} className="flex flex-1 flex-col items-center justify-end gap-1.5">
            <div
              className="w-full max-w-6 rounded-md"
              style={{
                height: `${(point.mood / 5) * 100}%`,
                background: MOOD_COLORS[point.mood],
              }}
              title={`${format(parseISO(point.date), 'd MMM')} · ${MOOD_LABELS[point.mood]}`}
            />
            <span className="text-[10px] font-bold text-muted-3">
              {format(parseISO(point.date), 'd')}
            </span>
          </div>
        ))}
      </div>

      <span className="text-xs text-muted">
        Mostly {MOOD_LABELS[Math.round(average)] ?? '—'} across {recorded.length} recorded{' '}
        {recorded.length === 1 ? 'day' : 'days'}
      </span>
    </div>
  );
}
