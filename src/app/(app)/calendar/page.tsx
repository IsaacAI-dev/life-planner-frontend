'use client';

import { useQuery } from '@tanstack/react-query';
import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { activitiesApi } from '@/lib/api/activities';
import { Card } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants';
import { formatTime, minutesBetween, toIsoDate } from '@/lib/format';
import type { Activity, CalendarDay, ImportedEvent } from '@/lib/types';
import { withAlpha } from '@/lib/utils';

type View = 'week' | 'month';

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const HOUR_HEIGHT = 52;

function EventBlock({ activity }: { activity: Activity }) {
  const color = activity.category?.color || FALLBACK_CATEGORY_COLOR;
  if (!activity.startTime) return null;

  const [hours, minutes] = activity.startTime.split(':').map(Number);
  const top = (hours - DAY_START_HOUR + minutes / 60) * HOUR_HEIGHT;
  const duration = minutesBetween(activity.startTime, activity.endTime) || 60;

  return (
    <div
      className="absolute right-1 left-1 overflow-hidden rounded-lg border px-2 py-1.5"
      style={{
        top,
        height: Math.max(28, (duration / 60) * HOUR_HEIGHT - 4),
        borderColor: color,
        background: withAlpha(color, 0.18),
      }}
    >
      <div className="truncate text-[11px] font-bold text-text-2">{activity.title}</div>
      <div className="truncate text-[10px] text-muted">{formatTime(activity.startTime)}</div>
    </div>
  );
}

/**
 * Imported events are read-only: not editable, no quota, no streak effect. They
 * are drawn muted and hatched behind activities so the board still reads as
 * yours at a glance, and they never look like something you can tick off.
 */
function ImportedBlock({ event }: { event: ImportedEvent }) {
  if (!event.startTime) return null;

  const [hours, minutes] = event.startTime.split(':').map(Number);
  const top = (hours - DAY_START_HOUR + minutes / 60) * HOUR_HEIGHT;
  const duration = minutesBetween(event.startTime, event.endTime) || 45;

  return (
    <div
      className="pointer-events-none absolute right-1 left-1 overflow-hidden rounded-lg border border-dashed px-2 py-1"
      style={{
        top,
        height: Math.max(24, (duration / 60) * HOUR_HEIGHT - 4),
        borderColor: 'var(--line-strong)',
        background:
          'repeating-linear-gradient(135deg, var(--surface-3) 0 6px, transparent 6px 12px)',
      }}
      title={`${event.title} · ${event.source}`}
    >
      <div className="truncate text-[11px] font-semibold text-muted-2">{event.title}</div>
      <div className="truncate text-[10px] text-muted-4">{event.source}</div>
    </div>
  );
}

function WeekGrid({ days }: { days: CalendarDay[] }) {
  const hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, index) => DAY_START_HOUR + index,
  );

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[46rem] grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
        <div />
        {days.map((day) => (
          <div key={day.date} className="border-b border-line px-2 pb-2 text-center">
            <div className="text-[10px] font-bold tracking-wider text-muted-3 uppercase">
              {format(new Date(day.date), 'EEE')}
            </div>
            <div className="font-display text-lg font-semibold">{format(new Date(day.date), 'd')}</div>
          </div>
        ))}

        <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
          {hours.map((hour, index) => (
            <div
              key={hour}
              className="absolute right-2 text-[10px] font-semibold text-muted-3"
              style={{ top: index * HOUR_HEIGHT - 6 }}
            >
              {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? 'AM' : 'PM'}
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div
            key={day.date}
            className="relative border-l border-line"
            style={{ height: hours.length * HOUR_HEIGHT }}
          >
            {hours.map((hour, index) => (
              <div
                key={hour}
                className="absolute right-0 left-0 border-t border-line"
                style={{ top: index * HOUR_HEIGHT }}
              />
            ))}
            {day.importedEvents
              ?.filter((event) => !event.allDay)
              .map((event) => <ImportedBlock key={event.id} event={event} />)}
            {day.activities.map((activity) => (
              <EventBlock key={activity.id} activity={activity} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthGrid({ days }: { days: CalendarDay[] }) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  if (!days.length) return null;

  const first = startOfMonth(new Date(days[0].date));
  const cells = eachDayOfInterval({ start: startOfWeek(first, { weekStartsOn: 1 }), end: endOfMonth(first) });

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
        <div key={label} className="pb-1 text-center text-[10px] font-bold tracking-wider text-muted-3 uppercase">
          {label}
        </div>
      ))}

      {cells.map((cell) => {
        const iso = toIsoDate(cell);
        const day = byDate.get(iso);

        return (
          <div key={iso} className="min-h-20 rounded-lg border border-line-2 bg-surface-2 p-1.5">
            <div className="text-[11px] font-bold text-muted-2">{format(cell, 'd')}</div>
            <div className="mt-1 flex flex-col gap-1">
              {day?.importedEvents?.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="truncate rounded border border-dashed border-line-strong px-1 py-0.5 text-[10px] font-semibold text-muted-3"
                >
                  {event.title}
                </div>
              ))}
              {day?.activities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="truncate rounded px-1 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: withAlpha(activity.category?.color || FALLBACK_CATEGORY_COLOR, 0.2),
                    color: activity.category?.color || FALLBACK_CATEGORY_COLOR,
                  }}
                >
                  {activity.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CalendarPage() {
  const [view, setView] = useState<View>('week');
  const [anchor, setAnchor] = useState(() => new Date());

  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const range =
    view === 'week'
      ? { from: toIsoDate(weekStart), to: toIsoDate(addDays(weekStart, 6)) }
      : { from: toIsoDate(startOfMonth(anchor)), to: toIsoDate(endOfMonth(anchor)) };

  const { data, isLoading } = useQuery({
    queryKey: ['calendar', range.from, range.to],
    queryFn: () => activitiesApi.calendar(range),
  });

  const step = (direction: 1 | -1) =>
    setAnchor(view === 'week' ? addDays(anchor, direction * 7) : addMonths(anchor, direction));

  return (
    <div className="mx-auto flex max-w-320 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {view === 'week'
            ? `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d')}`
            : format(anchor, 'MMMM yyyy')}
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-muted"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-muted"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <SegmentedControl
          className="ml-auto"
          options={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : (
        <Card className="p-3 sm:p-4">
          {view === 'week' ? <WeekGrid days={data?.days ?? []} /> : <MonthGrid days={data?.days ?? []} />}
        </Card>
      )}

      {data?.days.some((day) => day.importedEvents?.length) ? (
        <p className="flex items-center gap-2 text-xs text-muted">
          <span
            className="inline-block h-3 w-6 rounded border border-dashed"
            style={{
              borderColor: 'var(--line-strong)',
              background:
                'repeating-linear-gradient(135deg, var(--surface-3) 0 6px, transparent 6px 12px)',
            }}
          />
          Events from your connected calendars. Read-only — they don&apos;t count toward your weekly
          limit or your streak.
        </p>
      ) : null}

      {data?.flexibleTasks.length ? (
        <Card className="flex flex-col gap-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
            Flexible this range
          </span>
          <div className="flex flex-wrap gap-2">
            {data.flexibleTasks.map((task) => (
              <span
                key={task.id}
                className="rounded-lg border border-line-2 bg-surface-4 px-2.5 py-1.5 text-xs font-semibold"
              >
                {task.title} · {task.completedCount}/{task.targetCount}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
