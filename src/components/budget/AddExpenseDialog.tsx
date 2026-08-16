'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { CalendarDays, NotebookPen, Pencil } from 'lucide-react';
import { useState } from 'react';
import { budgetApi } from '@/lib/api/budget';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { BUDGET_CATEGORY_COLORS, BUDGET_CATEGORY_LABELS } from '@/lib/constants';
import { toIsoDate } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { BudgetCategory } from '@/lib/types';

const CATEGORIES: { value: BudgetCategory; hint: string }[] = [
  { value: 'MANDATORY', hint: 'Rent, utilities, debt' },
  { value: 'SECONDARY', hint: 'Groceries, transport, insurance' },
  { value: 'OPTIONAL', hint: 'Dining out, hobbies, fun' },
];

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  year: number;
  month: number;
  currencySymbol: string;
}

export function AddExpenseDialog({
  open,
  onClose,
  year,
  month,
  currencySymbol,
}: AddExpenseDialogProps) {
  const queryClient = useQueryClient();
  const notify = useToast();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('MANDATORY');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const monthStart = toIsoDate(startOfMonth(new Date(year, month - 1)));
  const monthEnd = toIsoDate(endOfMonth(new Date(year, month - 1)));

  const create = useMutation({
    mutationFn: () =>
      budgetApi.addExpense(year, month, {
        title,
        amount: Number(amount),
        category,
        date: date || undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      notify('Expense added');
      setTitle('');
      setAmount('');
      setNotes('');
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const submit = () => {
    if (!title.trim() || !(Number(amount) > 0)) {
      notify('Add a name and an amount above zero.', 'error');
      return;
    }
    create.mutate();
  };

  return (
    <Dialog open={open} onClose={onClose} title="New expense">
      <p className="-mt-2 mb-4 text-sm text-muted">
        {format(new Date(year, month - 1), 'MMMM yyyy')}
      </p>

      <div className="flex flex-col gap-3">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What was it for?"
          icon={<Pencil size={17} />}
        />

        <Input
          type="number"
          min={0}
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="18,500"
          icon={<span className="text-base font-bold">{currencySymbol}</span>}
          className="text-lg font-bold"
        />

        <div className="flex flex-col gap-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
            Category
          </span>

          {CATEGORIES.map((option) => {
            const selected = category === option.value;
            const color = BUDGET_CATEGORY_COLORS[option.value];

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className="flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left"
                style={{
                  borderColor: selected ? color : 'var(--line-2)',
                  background: selected ? `${color}1F` : 'transparent',
                }}
              >
                <span className="size-3 flex-none rounded-sm" style={{ background: color }} />
                <span className="flex flex-col">
                  <span className="text-sm font-bold">{BUDGET_CATEGORY_LABELS[option.value]}</span>
                  <span className="text-xs text-muted">{option.hint}</span>
                </span>
                <span
                  className="ml-auto flex size-5 flex-none items-center justify-center rounded-full border-2"
                  style={{ borderColor: selected ? color : 'var(--line-strong)' }}
                >
                  {selected ? <span className="size-2.5 rounded-full" style={{ background: color }} /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            min={monthStart}
            max={monthEnd}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            icon={<CalendarDays size={17} />}
          />
          <Input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add a note"
            icon={<NotebookPen size={17} />}
          />
        </div>

        <Button variant="accent" size="lg" loading={create.isPending} onClick={submit}>
          Save expense
        </Button>
      </div>
    </Dialog>
  );
}
