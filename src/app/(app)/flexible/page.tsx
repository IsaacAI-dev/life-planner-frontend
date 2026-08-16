'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarSync, CheckCircle2, Lock, Plus } from 'lucide-react';
import { activitiesApi } from '@/lib/api/activities';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Progress } from '@/components/ui/Progress';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { Activity } from '@/lib/types';
import { withAlpha } from '@/lib/utils';

function FlexibleRow({ task, onLog }: { task: Activity; onLog: () => void }) {
  const color = task.category?.color || FALLBACK_CATEGORY_COLOR;
  const complete = task.completedCount >= task.targetCount;

  return (
    <Card className="flex flex-wrap items-center gap-4">
      <span className="size-2.5 flex-none rounded-full" style={{ background: color }} />

      <div className="flex min-w-40 flex-1 flex-col gap-0.5">
        <span
          className={`flex items-center gap-1.5 text-sm font-bold ${complete ? 'text-muted line-through' : ''}`}
        >
          {task.title}
          {task.isPrivate ? <Lock size={13} className="text-muted-3" /> : null}
        </span>
        <span className="text-xs text-muted">
          {task.category?.name ?? 'Unsorted'} ·{' '}
          {complete
            ? 'target reached'
            : task.windowStart && task.windowEnd
              ? `window ${formatDate(task.windowStart)}–${formatDate(task.windowEnd)}`
              : 'no window'}
        </span>
      </div>

      <Progress
        value={task.completedCount}
        max={task.targetCount}
        color={color}
        className="w-full sm:w-40"
      />

      <span className="text-sm font-bold text-muted">
        {task.completedCount} / {task.targetCount}
      </span>

      {complete ? (
        <CheckCircle2 size={24} className="text-green-ink" />
      ) : (
        <Button
          size="sm"
          icon={<Plus size={15} />}
          onClick={onLog}
          style={{ borderColor: color, background: withAlpha(color, 0.16), color }}
        >
          Log
        </Button>
      )}
    </Card>
  );
}

export default function FlexiblePage() {
  const queryClient = useQueryClient();
  const notify = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['activities', 'flexible'],
    queryFn: () => activitiesApi.list({ flexible: true }),
  });

  const logProgress = useMutation({
    mutationFn: (id: string) => activitiesApi.logProgress(id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      notify('Progress logged');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (isLoading) return <PageSkeleton />;

  const tasks = data ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-3xl font-bold tracking-tight">Flexible tasks</h2>
        <p className="text-sm text-muted">Not tied to a day — finish them anywhere in the window.</p>
      </div>

      {tasks.length ? (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <FlexibleRow key={task.id} task={task} onLog={() => logProgress.mutate(task.id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarSync size={22} />}
          title="No flexible tasks yet"
          description="Flexible tasks track a number of completions across a window instead of sitting on one day. Add one from New activity."
        />
      )}
    </div>
  );
}
