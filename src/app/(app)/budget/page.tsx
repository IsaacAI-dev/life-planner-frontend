'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addMonths, format } from 'date-fns';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { budgetApi } from '@/lib/api/budget';
import { AddExpenseDialog } from '@/components/budget/AddExpenseDialog';
import { AddIncomeDialog } from '@/components/budget/AddIncomeDialog';
import { IncomeRow } from '@/components/budget/IncomeRow';
import { MonthSetup } from '@/components/budget/MonthSetup';
import { RollIncomeDialog } from '@/components/budget/RollIncomeDialog';
import { Button } from '@/components/ui/Button';
import { Card, CardLabel } from '@/components/ui/Card';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { BUDGET_CATEGORY_COLORS, BUDGET_CATEGORY_LABELS } from '@/lib/constants';
import { formatDate, formatMoney } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { BudgetIncome } from '@/lib/types';

/** The currency prefix Intl would use, for the amount fields in the dialogs. */
function symbolFor(currency: string): string {
  const parts = new Intl.NumberFormat('en', { style: 'currency', currency }).formatToParts(0);
  return parts.find((part) => part.type === 'currency')?.value ?? currency;
}

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const notify = useToast();

  const [anchor, setAnchor] = useState(() => new Date());
  const [hidden, setHidden] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [startedEmpty, setStartedEmpty] = useState(false);
  const [incomeDialog, setIncomeDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [editingIncome, setEditingIncome] = useState<BudgetIncome | null>(null);
  const [rolling, setRolling] = useState<BudgetIncome | null>(null);

  const year = anchor.getFullYear();
  const month = anchor.getMonth() + 1;

  const { data: ledger, isLoading } = useQuery({
    queryKey: ['budget', year, month, 'ledger'],
    queryFn: () => budgetApi.ledger(year, month),
    retry: false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['budget'] });
  const onError = (error: Error) => notify(error.message, 'error');

  const markArrived = useMutation({
    mutationFn: (id: string) => budgetApi.markArrived(year, month, id),
    onSuccess: invalidate,
    onError,
  });

  const markUnarrived = useMutation({
    mutationFn: (id: string) => budgetApi.markUnarrived(year, month, id),
    onSuccess: invalidate,
    onError,
  });

  const cancelIncome = useMutation({
    mutationFn: (id: string) => budgetApi.cancelIncome(year, month, id),
    onSuccess: () => {
      invalidate();
      notify('Income written off');
    },
    onError,
  });

  const deleteIncome = useMutation({
    mutationFn: (id: string) => budgetApi.deleteIncome(year, month, id),
    onSuccess: () => {
      invalidate();
      notify('Income removed');
    },
    onError,
  });

  const toggleExpensePaid = useMutation({
    mutationFn: ({ id, paid }: { id: string; paid: boolean }) =>
      paid ? budgetApi.markUnpaid(year, month, id) : budgetApi.markPaid(year, month, id),
    onSuccess: invalidate,
    onError,
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => budgetApi.deleteExpense(year, month, id),
    onSuccess: () => {
      invalidate();
      notify('Expense removed');
    },
    onError,
  });

  if (isLoading) return <PageSkeleton />;

  const currency = ledger?.currency ?? 'NGN';
  const symbol = symbolFor(currency);
  const show = (amount: number) => (hidden ? '••••••' : formatMoney(amount, currency));

  // A ledger is a view, not a resource: an untouched month returns 200 with
  // started:false rather than a 404, so this is one field check.
  const isEmptyMonth = !ledger || (!ledger.started && !startedEmpty);

  const monthPicker = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setAnchor(addMonths(anchor, -1))}
        aria-label="Previous month"
        className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-muted"
      >
        <ChevronLeft size={17} />
      </button>
      <span className="min-w-24 text-center text-sm font-bold">{format(anchor, 'MMM yyyy')}</span>
      <button
        type="button"
        onClick={() => setAnchor(addMonths(anchor, 1))}
        aria-label="Next month"
        className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-muted"
      >
        <ChevronRight size={17} />
      </button>
    </div>
  );

  if (isEmptyMonth) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-col">
            <CardLabel>Month view</CardLabel>
            <h2 className="font-display text-3xl font-bold tracking-tight">Budget</h2>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={hidden ? <Eye size={15} /> : <EyeOff size={15} />}
              onClick={() => setHidden(!hidden)}
            >
              Hide amounts
            </Button>
            {monthPicker}
          </div>
        </div>

        <MonthSetup year={year} month={month} onStartEmpty={() => setStartedEmpty(true)} />
      </div>
    );
  }

  const visibleIncomes = ledger.incomes.filter(
    (income) => showCancelled || income.status !== 'CANCELLED',
  );
  const cancelledCount = ledger.incomes.filter((income) => income.status === 'CANCELLED').length;

  return (
    <div className="mx-auto flex max-w-320 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex flex-col">
          <CardLabel>Month view</CardLabel>
          <h2 className="font-display text-3xl font-bold tracking-tight">Budget</h2>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={hidden ? <Eye size={15} /> : <EyeOff size={15} />}
            onClick={() => setHidden(!hidden)}
          >
            Hide amounts
          </Button>

          {monthPicker}

          <Button
            icon={<Banknote size={16} />}
            onClick={() => {
              setEditingIncome(null);
              setIncomeDialog(true);
            }}
            style={{
              borderColor: 'var(--green-ink)',
              background: 'rgba(91,228,155,0.14)',
              color: 'var(--green-ink)',
            }}
          >
            Add income
          </Button>

          <Button variant="accent" icon={<Plus size={16} />} onClick={() => setExpenseDialog(true)}>
            Add expense
          </Button>
        </div>
      </div>

      {/* The honest number and the optimistic one, side by side. */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card style={{ background: 'linear-gradient(120deg, var(--hero-1), var(--surface-2))' }}>
          <CardLabel>Available now</CardLabel>
          <div className="mt-1 font-display text-4xl font-bold break-all">
            {show(ledger.totals.availableNow)}
          </div>
          <p className="mt-2 text-xs text-muted">
            Arrived {show(ledger.totals.arrivedIncome)} less paid {show(ledger.totals.paidExpenses)}
          </p>
        </Card>

        <Card
          className="border-dashed"
          style={{ borderStyle: 'dashed', borderColor: 'var(--line-dash)' }}
        >
          <CardLabel>Projected balance</CardLabel>
          <div
            className="mt-1 font-display text-4xl font-bold break-all"
            style={{
              color: ledger.totals.projectedBalance < 0 ? 'var(--red-ink)' : 'var(--muted)',
            }}
          >
            {show(ledger.totals.projectedBalance)}
          </div>
          <p className="mt-2 text-xs text-muted">
            If all goes to plan · {show(ledger.totals.projectedIncome)} still expected,{' '}
            {show(ledger.totals.outstandingExpenses)} still owed
          </p>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <CardLabel>Income</CardLabel>
            <span className="text-xs text-muted">
              {ledger.counts.awaiting} awaiting · {ledger.counts.incomes} total
            </span>
          </div>

          {visibleIncomes.length ? (
            visibleIncomes.map((income) => (
              <IncomeRow
                key={income.id}
                income={income}
                currency={currency}
                hidden={hidden}
                busy={markArrived.isPending || markUnarrived.isPending}
                onMarkArrived={() => markArrived.mutate(income.id)}
                onUndo={() => markUnarrived.mutate(income.id)}
                onRoll={() => setRolling(income)}
                onEdit={() => {
                  setEditingIncome(income);
                  setIncomeDialog(true);
                }}
                onCancel={() => cancelIncome.mutate(income.id)}
                onDelete={() => deleteIncome.mutate(income.id)}
              />
            ))
          ) : (
            <Card className="flex flex-col items-center gap-3 py-10 text-center" dashed>
              <Banknote size={22} className="text-green-ink" />
              <span className="font-display text-lg font-semibold">No income yet</span>
              <p className="max-w-xs text-sm text-muted">
                Add your salary, a client invoice, anything you&apos;re expecting.
              </p>
              <Button
                onClick={() => {
                  setEditingIncome(null);
                  setIncomeDialog(true);
                }}
                style={{
                  borderColor: 'var(--green-ink)',
                  background: 'rgba(91,228,155,0.14)',
                  color: 'var(--green-ink)',
                }}
              >
                Add income
              </Button>
            </Card>
          )}

          {cancelledCount ? (
            <button
              type="button"
              onClick={() => setShowCancelled(!showCancelled)}
              className="flex items-center gap-2 self-start text-sm font-semibold text-muted-3"
            >
              {showCancelled ? <EyeOff size={15} /> : <Eye size={15} />}
              {showCancelled ? 'Hide' : 'Show'} cancelled ({cancelledCount})
            </button>
          ) : null}
        </section>

        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-3">
            <CardLabel>Paid by category</CardLabel>

            {ledger.byCategory.map((entry) => {
              const color = entry.color || BUDGET_CATEGORY_COLORS[entry.category];
              const percent = entry.total ? Math.round((entry.paid / entry.total) * 100) : 0;

              return (
                <div key={entry.category} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="size-2.5 flex-none rounded-sm" style={{ background: color }} />
                    <span className="font-semibold text-text-3">
                      {BUDGET_CATEGORY_LABELS[entry.category]}
                    </span>
                    <span className="ml-auto text-xs font-semibold text-muted">
                      {show(entry.paid)} of {show(entry.total)} paid
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-4">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${percent}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>

          <div className="flex items-baseline justify-between">
            <CardLabel>Expenses</CardLabel>
            <span className="text-xs text-muted">
              {ledger.counts.unpaid} unpaid · {ledger.counts.expenses} total
            </span>
          </div>

          {ledger.expenses.length ? (
            ledger.expenses.map((expense) => {
              const paid = expense.status === 'PAID';
              const color = BUDGET_CATEGORY_COLORS[expense.category];

              return (
                <Card
                  key={expense.id}
                  className="flex items-center gap-3 py-3"
                  style={{ borderLeftWidth: 3, borderLeftColor: color }}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpensePaid.mutate({ id: expense.id, paid })}
                    aria-label={paid ? `Mark ${expense.title} unpaid` : `Mark ${expense.title} paid`}
                    className="flex-none"
                  >
                    {paid ? (
                      <CheckCircle2 size={21} className="text-green-ink" />
                    ) : (
                      <Circle size={21} className="text-muted-3" />
                    )}
                  </button>

                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold">{expense.title}</span>
                    <span className="truncate text-xs text-muted">
                      {BUDGET_CATEGORY_LABELS[expense.category]} ·{' '}
                      {paid
                        ? `paid ${expense.paidAt ? formatDate(expense.paidAt, 'd MMM') : ''}`
                        : 'unpaid'}
                      {expense.date ? ` · ${formatDate(expense.date, 'd MMM')}` : ''}
                    </span>
                  </div>

                  <span className="ml-auto flex-none font-bold" style={{ color }}>
                    {show(expense.amount)}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteExpense.mutate(expense.id)}
                    aria-label={`Delete ${expense.title}`}
                    className="flex size-8 flex-none items-center justify-center rounded-lg border border-line-2 text-muted-3"
                  >
                    <Trash2 size={15} />
                  </button>
                </Card>
              );
            })
          ) : (
            <Card className="flex flex-col items-center gap-3 py-10 text-center" dashed>
              <Receipt size={22} className="text-violet-ink" />
              <span className="text-sm text-muted">
                No expenses logged for {format(anchor, 'MMM yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={() => setExpenseDialog(true)}>
                Add the first one
              </Button>
            </Card>
          )}
        </div>
      </div>

      <AddIncomeDialog
        key={editingIncome?.id ?? 'new-income'}
        open={incomeDialog}
        onClose={() => {
          setIncomeDialog(false);
          setEditingIncome(null);
        }}
        year={year}
        month={month}
        currencySymbol={symbol}
        editing={editingIncome}
      />

      <AddExpenseDialog
        open={expenseDialog}
        onClose={() => setExpenseDialog(false)}
        year={year}
        month={month}
        currencySymbol={symbol}
      />

      <RollIncomeDialog
        income={rolling}
        year={year}
        month={month}
        onClose={() => setRolling(null)}
      />
    </div>
  );
}
