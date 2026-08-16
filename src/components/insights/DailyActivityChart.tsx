'use client';

import { format, parseISO } from 'date-fns';
import type { DailyActivityPoint } from '@/lib/types';

/**
 * Stacked bars drawn as plain divs. The per-day breakdown comes from the
 * proposed GET /stats/daily (P-14); with no data the chart states so.
 */
export function DailyActivityChart({ points }: { points: DailyActivityPoint[] }) {
  if (!points.length) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        Daily totals need the per-day stats endpoint. Time by life area above still reflects the range.
      </p>
    );
  }

  const peak = Math.max(...points.map((point) => point.totalMinutes), 1);

  return (
    <div className="flex h-50 items-end gap-1.5">
      {points.map((point) => (
        <div key={point.date} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className="flex w-full max-w-8 flex-col-reverse overflow-hidden rounded-md"
            style={{ height: `${(point.totalMinutes / peak) * 100}%` }}
          >
            {point.byCategory.map((slice, index) => (
              <div
                key={`${point.date}-${index}`}
                style={{
                  height: `${point.totalMinutes ? (slice.minutes / point.totalMinutes) * 100 : 0}%`,
                  background: slice.color,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-muted-3">
            {format(parseISO(point.date), 'EEEEE')}
          </span>
        </div>
      ))}
    </div>
  );
}
