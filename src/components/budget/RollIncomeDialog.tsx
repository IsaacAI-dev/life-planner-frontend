'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMonths, format } from 'date-fns';
import { useState } from 'react';
import { budgetApi } from '@/lib/api/budget';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/lib/providers/ToastProvider';
import type { BudgetIncome } from '@/lib/types';

interface RollIncomeDialogProps {
  income: BudgetIncome | null;
  year: number;
  month: number;
  onClose: () => void;
}

/** Rolls go forwards only, and a row can only be rolled once. */
export function RollIncomeDialog({ income, year, month, onClose }: RollIncomeDialogProps) {
  const queryClient = useQueryClient();
  const notify = useToast();
  const [offset, setOffset] = useState(1);

  const anchor = new Date(year, month - 1);
  const target = addMonths(anchor, offset);

  const roll = useMutation({
    mutationFn: () =>
      budgetApi.rollIncome(year, month, income!.id, {
        year: target.getFullYear(),
        month: target.getMonth() + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      notify(`Rolled forward to ${format(target, 'MMMM')}`);
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  return (
    <Dialog open={income !== null} onClose={onClose} title="Roll forward">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          {income?.title} stays here marked as slipped, and a fresh expected row appears in the month
          you pick. Keeping both is what makes a client who slips every month visible.
        </p>

        <div className="flex flex-col gap-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
            Move it to
          </span>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setOffset(value)}
                className="rounded-xl border px-3 py-2.5 text-sm font-bold"
                style={{
                  borderColor: offset === value ? 'var(--violet-ink-2)' : 'var(--line-2)',
                  background: offset === value ? 'var(--surface-4)' : 'transparent',
                  color: offset === value ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {format(addMonths(anchor, value), 'MMM yyyy')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" className="flex-1" loading={roll.isPending} onClick={() => roll.mutate()}>
            Roll forward
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
