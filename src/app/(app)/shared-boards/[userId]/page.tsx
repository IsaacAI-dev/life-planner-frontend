'use client';

import { useQuery } from '@tanstack/react-query';
import { addDays, format, startOfWeek } from 'date-fns';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { boardsApi } from '@/lib/api/boards';
import { Card, CardLabel } from '@/components/ui/Card';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants';
import { formatTime, toIsoDate } from '@/lib/format';
import { withAlpha } from '@/lib/utils';

export default function SharedBoardPage() {
  const params = useParams<{ userId: string }>();
  const [anchor, setAnchor] = useState(() => new Date());

  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const range = { from: toIsoDate(weekStart), to: toIsoDate(addDays(weekStart, 6)) };

  const { data, isLoading } = useQuery({
    queryKey: ['shared-board', params.userId, range.from],
    queryFn: () => boardsApi.viewBoard(params.userId, range),
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Link href="/shared-boards" className="flex items-center gap-2 text-sm font-bold text-violet-ink">
        <ArrowLeft size={16} />
        Back to shared boards
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d')}
        </h2>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAnchor(addDays(anchor, -7))}
            aria-label="Previous week"
            className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-muted"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(addDays(anchor, 7))}
            aria-label="Next week"
            className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-muted"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted">
        This board is read-only. Private activities appear only if you were granted full access, and
        events from their connected calendars are never shared.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.days.map((day) => (
          <Card key={day.date} className="flex flex-col gap-2.5">
            <CardLabel>{format(new Date(day.date), 'EEEE d MMM')}</CardLabel>

            {day.activities.length ? (
              day.activities.map((activity) => {
                const color = activity.category?.color || FALLBACK_CATEGORY_COLOR;

                return (
                  <div
                    key={activity.id}
                    className="rounded-lg border px-2.5 py-2"
                    style={{ borderColor: color, background: withAlpha(color, 0.12) }}
                  >
                    <div className="truncate text-sm font-bold">{activity.title}</div>
                    <div className="text-xs text-muted">{formatTime(activity.startTime)}</div>
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-muted-3">Nothing planned</span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
