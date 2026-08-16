import { request } from '@/lib/api/client';
import type {
  BudgetCategory,
  BudgetExpense,
  BudgetIncome,
  BudgetLedger,
  ExpenseStatus,
  IncomeStatus,
  RecentBudgetMonth,
} from '@/lib/types';

export interface CreateIncomeBody {
  title: string;
  amount: number;
  description?: string;
  source?: string;
  expectedDate?: string;
  /** Pass ARRIVED to log money already banked without a second call. */
  status?: 'ARRIVED';
  recurring?: boolean;
}

export interface CreateExpenseBody {
  title: string;
  amount: number;
  category: BudgetCategory;
  date?: string;
  notes?: string;
  status?: ExpenseStatus;
}

/**
 * The server owns every total. Nothing here recomputes a balance — two surfaces
 * deriving it independently is how they end up disagreeing.
 */
export const budgetApi = {
  /** One call for the whole screen. Filters narrow the lists, never the totals. */
  ledger: (
    year: number,
    month: number,
    query: { status?: IncomeStatus; expenseStatus?: ExpenseStatus; category?: BudgetCategory } = {},
  ) => request<BudgetLedger>(`/budget/${year}/${month}/ledger`, { query }),

  /** Backs the first-run chooser in one call instead of three ledger fetches. */
  recentMonths: (limit = 3) =>
    request<RecentBudgetMonth[]>('/budget/recent-months', { query: { limit }, unwrap: 'months' }),

  setNotes: (year: number, month: number, notes: string) =>
    request<{ notes: string | null }>(`/budget/${year}/${month}`, { method: 'PUT', body: { notes } }),

  incomes: (year: number, month: number, query: { status?: IncomeStatus; arrivedOnly?: boolean } = {}) =>
    request<BudgetIncome[]>(`/budget/${year}/${month}/incomes`, { query, unwrap: 'incomes' }),

  addIncome: (year: number, month: number, body: CreateIncomeBody) =>
    request<BudgetIncome>(`/budget/${year}/${month}/incomes`, {
      method: 'POST',
      body,
      unwrap: 'income',
    }),

  updateIncome: (
    year: number,
    month: number,
    id: string,
    body: Partial<Pick<CreateIncomeBody, 'title' | 'amount' | 'description' | 'source' | 'expectedDate'>>,
  ) =>
    request<BudgetIncome>(`/budget/${year}/${month}/incomes/${id}`, {
      method: 'PATCH',
      body,
      unwrap: 'income',
    }),

  /** The most-used control on the page. Reversible without a confirmation. */
  markArrived: (year: number, month: number, id: string, receivedAt?: string) =>
    request<BudgetIncome>(`/budget/${year}/${month}/incomes/${id}/arrived`, {
      method: 'POST',
      body: receivedAt ? { receivedAt } : {},
      unwrap: 'income',
    }),

  markUnarrived: (year: number, month: number, id: string) =>
    request<BudgetIncome>(`/budget/${year}/${month}/incomes/${id}/unarrived`, {
      method: 'POST',
      body: {},
      unwrap: 'income',
    }),

  /**
   * Does not move the row: the original is marked DEFERRED where it is and a
   * fresh PROJECTED copy appears in the target month, so a client who slips
   * three months running stays visible.
   */
  rollIncome: (year: number, month: number, id: string, target: { year: number; month: number }) =>
    request<{ deferred: BudgetIncome; created: BudgetIncome }>(
      `/budget/${year}/${month}/incomes/${id}/roll`,
      { method: 'POST', body: target },
    ),

  cancelIncome: (year: number, month: number, id: string) =>
    request<BudgetIncome>(`/budget/${year}/${month}/incomes/${id}/cancel`, {
      method: 'POST',
      body: {},
      unwrap: 'income',
    }),

  deleteIncome: (year: number, month: number, id: string) =>
    request<{ ok: true }>(`/budget/${year}/${month}/incomes/${id}`, { method: 'DELETE' }),

  addExpense: (year: number, month: number, body: CreateExpenseBody) =>
    request<BudgetExpense>(`/budget/${year}/${month}/expenses`, {
      method: 'POST',
      body,
      unwrap: 'expense',
    }),

  updateExpense: (year: number, month: number, id: string, body: Partial<CreateExpenseBody>) =>
    request<BudgetExpense>(`/budget/${year}/${month}/expenses/${id}`, {
      method: 'PATCH',
      body,
      unwrap: 'expense',
    }),

  markPaid: (year: number, month: number, id: string) =>
    request<BudgetExpense>(`/budget/${year}/${month}/expenses/${id}/paid`, {
      method: 'POST',
      body: {},
      unwrap: 'expense',
    }),

  markUnpaid: (year: number, month: number, id: string) =>
    request<BudgetExpense>(`/budget/${year}/${month}/expenses/${id}/unpaid`, {
      method: 'POST',
      body: {},
      unwrap: 'expense',
    }),

  deleteExpense: (year: number, month: number, id: string) =>
    request<{ ok: true }>(`/budget/${year}/${month}/expenses/${id}`, { method: 'DELETE' }),

  /** Copies land PROJECTED and COMMITTED — carrying "paid" forward would lie. */
  copyFrom: (
    year: number,
    month: number,
    body: { fromYear: number; fromMonth: number; includeIncomes?: boolean; includeExpenses?: boolean },
  ) => request<BudgetLedger>(`/budget/${year}/${month}/copy-from`, { method: 'POST', body }),
};
