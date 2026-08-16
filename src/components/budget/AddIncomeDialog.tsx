'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useState } from 'react';
import { budgetApi } from '@/lib/api/budget';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Input } from '@/components/ui/Input';
import { toIsoDate } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { BudgetIncome } from '@/lib/types';

interface AddIncomeDialogProps {
  open: boolean;
  onClose: () => void;
  year: number;
  month: number;
  currencySymbol: string;
  /** Present when editing an existing row. */
  editing?: BudgetIncome | null;
}

function Toggle({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left"
      style={{
        borderColor: checked ? 'var(--violet-ink-2)' : 'var(--line-2)',
        background: checked ? 'var(--surface-4)' : 'transparent',
      }}
    >
      <span
        className="flex size-5 flex-none items-center justify-center rounded-full border-2"
        style={{ borderColor: checked ? 'var(--violet-ink)' : 'var(--line-strong)' }}
      >
        {checked ? <span className="size-2.5 rounded-full bg-violet-ink" /> : null}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-bold">{title}</span>
        <span className="text-xs text-muted">{hint}</span>
      </span>
    </button>
  );
}

export function AddIncomeDialog({
  open,
  onClose,
  year,
  month,
  currencySymbol,
  editing = null,
}: AddIncomeDialogProps) {
  const queryClient = useQueryClient();
  const notify = useToast();

  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [source, setSource] = useState(editing?.source ?? '');
  const [expectedDate, setExpectedDate] = useState(editing?.expectedDate ?? '');
  const [alreadyBanked, setAlreadyBanked] = useState(false);
  const [recurring, setRecurring] = useState(editing?.recurring ?? false);

  // expectedDate must fall inside the month being viewed; the API rejects otherwise.
  const monthStart = toIsoDate(startOfMonth(new Date(year, month - 1)));
  const monthEnd = toIsoDate(endOfMonth(new Date(year, month - 1)));

  const save = useMutation({
    mutationFn: () => {
      const numeric = Number(amount);

      if (editing) {
        return budgetApi.updateIncome(year, month, editing.id, {
          title,
          amount: numeric,
          source: source || undefined,
          expectedDate: expectedDate || undefined,
        });
      }

      return budgetApi.addIncome(year, month, {
        title,
        amount: numeric,
        source: source || undefined,
        expectedDate: expectedDate || undefined,
        status: alreadyBanked ? 'ARRIVED' : undefined,
        recurring: recurring || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      notify(editing ? 'Income updated' : 'Income added');
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const submit = () => {
    if (!title.trim()) {
      notify('Give it a name so you know what it is.', 'error');
      return;
    }
    if (!(Number(amount) > 0)) {
      notify('Enter an amount above zero.', 'error');
      return;
    }
    save.mutate();
  };

  return (
    <Dialog open={open} onClose={onClose} title={editing ? 'Edit income' : 'Add income'}>
      <p className="-mt-2 mb-4 text-sm text-muted">
        {format(new Date(year, month - 1), 'MMMM yyyy')}
      </p>

      <div className="flex flex-col gap-4">
        <Field label="Amount">
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="180,000"
            icon={<span className="text-base font-bold">{currencySymbol}</span>}
            className="text-lg font-bold"
          />
        </Field>

        <Field label="What is it">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Salary, invoice, refund…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Who from">
            <Input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Client or employer"
            />
          </Field>
          <Field label="Expected">
            <Input
              type="date"
              min={monthStart}
              max={monthEnd}
              value={expectedDate}
              onChange={(event) => setExpectedDate(event.target.value)}
            />
          </Field>
        </div>

        {editing ? null : (
          <>
            <Toggle
              title="Already in the bank"
              hint="Counts towards available now"
              checked={alreadyBanked}
              onChange={setAlreadyBanked}
            />
            <Toggle
              title="Repeats monthly"
              hint="Shows up again next month"
              checked={recurring}
              onChange={setRecurring}
            />
          </>
        )}

        <Button variant="accent" size="lg" loading={save.isPending} onClick={submit}>
          {editing ? 'Save changes' : 'Save income'}
        </Button>
      </div>
    </Dialog>
  );
}
