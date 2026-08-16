'use client';

import { Ban, CalendarArrowUp, CheckCircle2, Clock, Landmark, Pencil, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate, formatMoney } from '@/lib/format';
import type { BudgetIncome } from '@/lib/types';
import { cn } from '@/lib/utils';

interface IncomeRowProps {
  income: BudgetIncome;
  currency: string;
  hidden: boolean;
  onMarkArrived: () => void;
  onUndo: () => void;
  onRoll: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  busy: boolean;
}

/**
 * Fill and weight carry the status, not colour — colour is already spoken for by
 * budget categories on the expense side. Arrived money is solid and full-colour;
 * projected money is outlined and provisional; deferred and cancelled are muted
 * because they count toward nothing.
 */
export function IncomeRow({
  income,
  currency,
  hidden,
  onMarkArrived,
  onUndo,
  onRoll,
  onEdit,
  onCancel,
  onDelete,
  busy,
}: IncomeRowProps) {
  const arrived = income.status === 'ARRIVED';
  const inactive = income.status === 'DEFERRED' || income.status === 'CANCELLED';
  const amount = hidden ? '••••••' : formatMoney(income.amount, currency);

  const subtitle = [
    income.source,
    arrived && income.receivedAt
      ? `arrived ${formatDate(income.receivedAt, 'd MMM')}`
      : income.status === 'DEFERRED'
        ? 'rolled to a later month'
        : income.status === 'CANCELLED'
          ? 'written off'
          : income.expectedDate
            ? `expected ${formatDate(income.expectedDate, 'd MMM')}`
            : 'no date set',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-2xl border p-3.5',
        arrived ? 'bg-surface-2' : 'bg-transparent',
      )}
      style={{
        borderColor: arrived ? 'var(--line-2)' : 'var(--line-2)',
        borderStyle: income.status === 'PROJECTED' ? 'solid' : 'solid',
        opacity: inactive ? 0.55 : 1,
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="flex size-9 flex-none items-center justify-center rounded-xl"
          style={{
            background: arrived ? 'rgba(91,228,155,0.14)' : 'var(--surface-4)',
            color: arrived ? 'var(--green-ink)' : 'var(--muted-2)',
          }}
        >
          {arrived ? <Landmark size={17} /> : <Clock size={17} />}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={cn(
              'truncate text-sm font-bold',
              income.status === 'CANCELLED' && 'line-through',
            )}
          >
            {income.title}
          </span>
          <span className="truncate text-xs text-muted">{subtitle}</span>

          {income.rolledOver ? (
            <span
              className="mt-1 flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold"
              style={{ background: 'rgba(240,169,59,0.14)', color: 'var(--amber-ink)' }}
            >
              <RotateCcw size={12} />
              Rolled over
            </span>
          ) : null}
        </div>

        <div className="flex flex-none flex-col items-end">
          <span
            className="font-display text-lg font-bold"
            style={{ color: arrived ? 'var(--green-ink)' : 'var(--text-2)' }}
          >
            {amount}
          </span>
          <span className="text-[10px] font-extrabold tracking-wider text-muted-3 uppercase">
            {arrived ? 'Arrived' : income.status === 'PROJECTED' ? 'Expected' : income.status}
          </span>
        </div>

        {income.status === 'PROJECTED' ? (
          <Button
            size="sm"
            icon={<CheckCircle2 size={15} />}
            loading={busy}
            onClick={onMarkArrived}
            style={{
              borderColor: 'var(--green-ink)',
              background: 'rgba(91,228,155,0.14)',
              color: 'var(--green-ink)',
            }}
          >
            Mark as arrived
          </Button>
        ) : arrived ? (
          <Button size="sm" variant="outline" icon={<Undo2 size={15} />} loading={busy} onClick={onUndo}>
            Undo
          </Button>
        ) : null}
      </div>

      <div className="flex gap-1.5">
        {income.status === 'PROJECTED' ? (
          <IconAction label="Roll to a later month" onClick={onRoll}>
            <CalendarArrowUp size={15} />
          </IconAction>
        ) : null}
        <IconAction label="Edit" onClick={onEdit}>
          <Pencil size={15} />
        </IconAction>
        {income.status !== 'CANCELLED' ? (
          <IconAction label="Cancel" onClick={onCancel}>
            <Ban size={15} />
          </IconAction>
        ) : null}
        <IconAction label="Delete" onClick={onDelete}>
          <Trash2 size={15} />
        </IconAction>
      </div>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-lg border border-line-2 text-muted-3 hover:text-text-2"
    >
      {children}
    </button>
  );
}
