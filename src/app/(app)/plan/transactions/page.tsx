'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Receipt } from 'lucide-react';
import Link from 'next/link';
import { subscriptionApi } from '@/lib/api/subscription';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatMoney } from '@/lib/format';

const STATUS_COLORS: Record<string, string> = {
  PAID: 'var(--green-ink)',
  REFUNDED: 'var(--amber-ink)',
  FAILED: 'var(--red-ink)',
};

export default function TransactionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: subscriptionApi.transactions,
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link href="/plan" className="flex items-center gap-2 text-sm font-bold text-violet-ink">
        <ArrowLeft size={16} />
        Back to plan
      </Link>

      <h2 className="font-display text-3xl font-bold tracking-tight">Receipts</h2>

      {data?.length ? (
        <div className="flex flex-col gap-2.5">
          {data.map((transaction) => (
            <Card key={transaction.id} className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold">
                  {transaction.description ?? 'Subscription'}
                </span>
                <span className="text-xs text-muted">
                  {formatDate(transaction.occurredAt, 'd MMM yyyy')} · {transaction.provider}
                  {transaction.taxAmount
                    ? ` · incl. ${formatMoney(transaction.taxAmount, transaction.currency)} tax`
                    : ''}
                  {transaction.providerInvoiceId ? ` · ${transaction.providerInvoiceId}` : ''}
                </span>
              </div>

              <span
                className="ml-auto text-sm font-bold"
                style={{ color: STATUS_COLORS[transaction.status] ?? 'var(--text)' }}
              >
                {formatMoney(transaction.grossAmount, transaction.currency)}
              </span>


            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Receipt size={22} />}
          title="No payments yet"
          description="Receipts for your subscription will appear here once a payment goes through."
        />
      )}
    </div>
  );
}
