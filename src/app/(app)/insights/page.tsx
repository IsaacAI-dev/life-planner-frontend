'use client';

import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { useState } from 'react';
import { statsApi } from '@/lib/api/planner';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardLabel } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { DailyActivityChart } from '@/components/insights/DailyActivityChart';
import { MoodTrend } from '@/components/insights/MoodTrend';
import { formatDuration, toIsoDate } from '@/lib/format';

type Period = 'week' | 'month' | 'quarter';

const PERIOD_DAYS: Record<Period, number> = { week: 7, month: 30, quarter: 90 };

function StatTile({ label, value, hint, color }: { label: string; value: string; hint: string; color?: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <CardLabel>{label}</CardLabel>
      <span className="font-display text-3xl font-bold" style={color ? { color } : undefined}>
        {value}
      </span>
      <span className="text-xs text-muted">{hint}</span>
    </Card>
  );
}

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>('week');

  const range = {
    from: toIsoDate(subDays(new Date(), PERIOD_DAYS[period] - 1)),
    to: toIsoDate(new Date()),
  };

  const { data: overview, isLoading } = useQuery({
    queryKey: ['stats', 'overview', range.from, range.to],
    queryFn: () => statsApi.overview(range),
  });

  const { data: categories } = useQuery({
    queryKey: ['stats', 'categories', range.from, range.to],
    queryFn: () => statsApi.categories(range),
  });

  const { data: streaks } = useQuery({ queryKey: ['streaks'], queryFn: statsApi.streaks });

  const { data: daily } = useQuery({
    queryKey: ['stats', 'daily', range.from, range.to],
    queryFn: () => statsApi.daily(range),
  });

  const { data: mood } = useQuery({
    queryKey: ['stats', 'mood', range.from, range.to],
    queryFn: () => statsApi.mood(range),
  });

  const { data: coachInsight } = useQuery({
    queryKey: ['stats', 'coach-insight'],
    queryFn: statsApi.coachInsight,
  });

  if (isLoading) return <PageSkeleton />;

  // These are activity counts, not durations — the API renamed them for a reason.
  const totalActivities = categories?.reduce((sum, item) => sum + item.total, 0) ?? 0;

  return (
    <div className="mx-auto flex max-w-320 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight">Insights</h2>
        <SegmentedControl
          className="ml-auto"
          options={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'quarter', label: 'Quarter' },
          ]}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Planned"
          value={formatDuration(overview?.plannedMinutes ?? 0)}
          hint={`across ${categories?.length ?? 0} life areas`}
        />
        <StatTile
          label="Completed"
          value={formatDuration(overview?.completedMinutes ?? 0)}
          hint={`${Math.round((overview?.completionRate ?? 0) * 100)}% of what you planned`}
          color="var(--cyan-ink)"
        />
        <StatTile
          label="Streak"
          value={`${streaks?.current ?? 0}d`}
          hint={
            streaks && streaks.current >= streaks.longest ? 'best yet' : `best ${streaks?.longest ?? 0}d`
          }
          color="var(--orange-ink)"
        />
        <StatTile
          label="Notes written"
          value={`${overview?.notesWritten ?? 0} / ${overview?.daysInRange ?? 0}`}
          hint="days with a reflection"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-lg font-semibold">Activities by life area</h3>
            <span className="text-xs text-muted">{totalActivities} total</span>
          </div>

          <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-4">
            {categories?.map((item) => (
              <div
                key={item.name}
                style={{
                  width: `${totalActivities ? (item.total / totalActivities) * 100 : 0}%`,
                  background: item.color,
                }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {categories?.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 flex-none rounded-full" style={{ background: item.color }} />
                <span className="truncate font-semibold text-text-3">{item.name}</span>
                <span className="ml-auto font-bold text-muted">
                  {item.done} / {item.total}
                </span>
              </div>
            ))}
          </div>

          {coachInsight ? (
            <div className="flex gap-3 rounded-xl border border-line-2 bg-surface-4 p-3.5">
              <Avatar
                name={coachInsight.author?.name ?? 'Coach'}
                src={coachInsight.author?.avatarUrl}
                size={34}
              />
              <div className="flex flex-col gap-1">
                <span className="text-[10.5px] font-bold tracking-[0.1em] text-pink-ink uppercase">
                  Coach insight
                </span>
                <p className="text-sm text-text-3">{coachInsight.body}</p>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-lg font-semibold">Daily activity</h3>
            <span className="text-xs text-muted">Last {PERIOD_DAYS[period]} days</span>
          </div>
          <DailyActivityChart points={daily ?? []} />
        </Card>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-lg font-semibold">How you felt</h3>
          <span className="text-xs text-muted">
            {mood?.average ? `Averaging ${mood.average} of 5` : 'From your day notes'}
          </span>
        </div>
        <MoodTrend series={mood} />
      </Card>
    </div>
  );
}
