'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronRight, Copy, FilePlus2, PiggyBank, Plus } from 'lucide-react';
import { useState } from 'react';
import { budgetApi } from '@/lib/api/budget';
import { Button } from '@/components/ui/Button';
import { Card, CardLabel } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/providers/ToastProvider';

interface MonthSetupProps {
  year: number;
  month: number;
  onStartEmpty: () => void;
}

/** Shown when a month has never been touched (`ledger.started === false`). */
export function MonthSetup({ year, month, onStartEmpty }: MonthSetupProps) {
  const queryClient = useQueryClient();
  const notify = useToast();
  const [choosing, setChoosing] = useState(false);

  const anchor = new Date(year, month - 1);

  const { data: months, isPending } = useQuery({
    queryKey: ['budget', 'recent-months'],
    queryFn: () => budgetApi.recentMonths(3),
    enabled: choosing,
  });

  const copyFrom = useMutation({
    mutationFn: (from: { year: number; month: number }) =>
      budgetApi.copyFrom(year, month, {
        fromYear: from.year,
        fromMonth: from.month,
        includeIncomes: true,
        includeExpenses: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      notify('Month copied across');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const intro = (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-4 text-violet-ink">
        <PiggyBank size={24} />
      </span>
      <h3 className="font-display text-2xl font-semibold">
        No budget for {format(anchor, 'MMMM yyyy')} yet
      </h3>
      <p className="max-w-md text-sm text-muted">
        Reuse a recent month to bring across recurring income and expenses, or start with an empty
        ledger and add income as it comes.
      </p>
    </div>
  );

  if (!choosing) {
    return (
      <Card className="flex flex-col items-center gap-3 py-14" dashed>
        {intro}
        <Button variant="accent" size="lg" icon={<Plus size={17} />} onClick={() => setChoosing(true)}>
          Create budget for {format(anchor, 'MMM yyyy')}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 py-8" dashed>
      {intro}

      <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5">
        <CardLabel>Re-populate from a recent month</CardLabel>

        {isPending ? (
          <>
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </>
        ) : (
          months?.map((candidate) => {
            const label = format(new Date(candidate.year, candidate.month - 1), 'MMMM yyyy');

            return (
              <button
                key={`${candidate.year}-${candidate.month}`}
                type="button"
                disabled={!candidate.hasData || copyFrom.isPending}
                onClick={() => copyFrom.mutate({ year: candidate.year, month: candidate.month })}
                className="flex items-center gap-3 rounded-xl border border-line-2 bg-surface-3 px-3.5 py-3 text-left disabled:opacity-45"
              >
                <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-surface-4 text-violet-ink">
                  <Copy size={17} />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-bold">
                    {label}
                    {candidate.hasData ? '' : ' (empty)'}
                  </span>
                  <span className="text-xs text-muted">
                    {candidate.hasData
                      ? `${candidate.recurringIncomes} recurring income · ${candidate.expenses} expenses`
                      : 'Nothing to copy'}
                  </span>
                </span>
                <ChevronRight size={18} className="ml-auto flex-none text-muted-4" />
              </button>
            );
          })
        )}

        <CardLabel>Or</CardLabel>

        <button
          type="button"
          onClick={onStartEmpty}
          className="flex items-center gap-3 rounded-xl border border-line-2 bg-surface-3 px-3.5 py-3 text-left"
        >
          <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-surface-4 text-cyan-ink">
            <FilePlus2 size={17} />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-bold">Create a brand new budget</span>
            <span className="text-xs text-muted">Add income and expenses as they come</span>
          </span>
          <ChevronRight size={18} className="ml-auto flex-none text-muted-4" />
        </button>

        <button
          type="button"
          onClick={() => setChoosing(false)}
          className="self-start text-sm font-semibold text-muted"
        >
          Cancel
        </button>
      </div>
    </Card>
  );
}
