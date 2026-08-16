'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Flag, Pin, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { goalsApi } from '@/lib/api/planner';
import { NewGoalDialog } from '@/components/goals/NewGoalDialog';
import { UpgradeDialog } from '@/components/plan/UpgradeDialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { usePlan } from '@/lib/providers/PlanProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import type { Goal } from '@/lib/types';

function ProgressRing({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative size-27 flex-none">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--surface-4)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--cyan-ink)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold">{percent}%</span>
        <span className="text-[11px] font-semibold text-muted">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const queryClient = useQueryClient();
  const notify = useToast();
  const done = goal.milestones.filter((milestone) => milestone.isDone).length;

  const setFeatured = useMutation({
    mutationFn: () => goalsApi.setFeatured(goal.id, !goal.featured),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const toggleMilestone = useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
      goalsApi.toggleMilestone(goal.id, id, isDone),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const removeMilestone = useMutation({
    mutationFn: (milestoneId: string) => goalsApi.removeMilestone(goal.id, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      notify('Milestone removed');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const nextMilestone = goal.milestones.find((milestone) => !milestone.isDone);

  return (
    <Card
      className="flex flex-col gap-4"
      style={goal.featured ? { borderColor: 'var(--cyan-ink)' } : undefined}
    >
      <div className="flex flex-wrap items-center gap-4">
        <ProgressRing done={done} total={goal.milestones.length} />

        <div className="flex min-w-50 flex-1 flex-col gap-1">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-cyan-ink uppercase">
            {goal.category?.name ?? 'Goal'}
            {goal.featured ? ' \u00b7 Featured' : ''}
          </span>
          <div className="flex items-start gap-2">
            <h3 className="font-display text-2xl leading-tight font-semibold">{goal.title}</h3>
            <button
              type="button"
              onClick={() => setFeatured.mutate()}
              aria-label={goal.featured ? 'Unpin this goal' : 'Pin this goal to the top'}
              className="mt-1 flex-none"
              style={{ color: goal.featured ? 'var(--cyan-ink)' : 'var(--muted-4)' }}
            >
              <Pin size={17} fill={goal.featured ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="text-sm text-muted">
            {goal.milestones.length - done} milestones left
            {nextMilestone ? ` · next: ${nextMilestone.title}` : ''}
            {goal.targetDate ? ` · by ${formatDate(goal.targetDate, 'd MMM yyyy')}` : ''}
          </p>
        </div>
      </div>

      {goal.milestones.length ? (
        <div className="flex flex-col gap-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Milestones</span>
          <div className="flex flex-wrap gap-2">
            {goal.milestones.map((milestone) => (
              <span
                key={milestone.id}
                className="group flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold"
                style={{
                  borderColor: milestone.isDone ? 'var(--cyan-ink)' : 'var(--line-2)',
                  color: milestone.isDone ? 'var(--cyan-ink)' : 'var(--muted)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleMilestone.mutate({ id: milestone.id, isDone: !milestone.isDone })
                  }
                  className="flex items-center gap-2"
                >
                  {milestone.isDone ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                  {milestone.title}
                  {milestone.dueDate ? (
                    <span className="text-muted-3">{formatDate(milestone.dueDate)}</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => removeMilestone.mutate(milestone.id)}
                  aria-label={`Remove ${milestone.title}`}
                  className="text-muted-4 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:text-red-ink"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export default function GoalsPage() {
  const { canAddGoal } = usePlan();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['goals'], queryFn: goalsApi.list });

  if (isLoading) return <PageSkeleton />;

  const goals = data ?? [];
  // Exactly one goal can be featured; it leads the list.
  const ordered = [...goals].sort((a, b) => Number(b.featured) - Number(a.featured));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight">Your goals</h2>
        <Button
          variant="solid"
          className="ml-auto"
          icon={<Plus size={17} />}
          onClick={() => (canAddGoal ? setDialogOpen(true) : setLimitOpen(true))}
        >
          New goal
        </Button>
      </div>

      {goals.length ? (
        <div className="flex flex-col gap-3">
          {ordered.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Flag size={22} />}
          title="No goals yet"
          description="Set a goal and break it into milestones. Activities can then be linked to it."
          action={
            <Button variant="accent" onClick={() => setDialogOpen(true)}>
              Create your first goal
            </Button>
          }
        />
      )}

      <NewGoalDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      <UpgradeDialog open={limitOpen} onClose={() => setLimitOpen(false)} reason="goals" />
    </div>
  );
}
