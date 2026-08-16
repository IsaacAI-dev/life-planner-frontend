'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { CreditCard, Receipt, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { subscriptionApi } from '@/lib/api/subscription';
import { BeneficiaryFields } from '@/components/plan/BeneficiaryFields';
import { PlanCard } from '@/components/plan/PlanCard';
import { SeatSelector } from '@/components/plan/SeatSelector';
import { RegionPicker } from '@/components/plan/RegionPicker';
import { Button } from '@/components/ui/Button';
import { Card, CardLabel } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatMoney } from '@/lib/format';
import { usePlan } from '@/lib/providers/PlanProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import type { BillingInterval } from '@/lib/types';

export default function PlanPage() {
  const { subscription, state } = usePlan();
  const notify = useToast();

  const [interval, setInterval] = useState<BillingInterval>('MONTHLY');
  const [seats, setSeats] = useState(1);
  const [beneficiaries, setBeneficiaries] = useState<string[]>([]);
  const [beneficiariesValid, setBeneficiariesValid] = useState(false);

  const { data: catalog, isLoading } = useQuery({
    queryKey: ['plans', 'WEB'],
    queryFn: () => subscriptionApi.plans('WEB'),
  });

  const checkout = useMutation({
    mutationFn: () =>
      subscriptionApi.checkout({
        tier: 'PRO',
        interval,
        platform: 'WEB',
        seats,
        beneficiaryEmails: seats > 1 ? beneficiaries : undefined,
      }),
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const billingPortal = useMutation({
    mutationFn: subscriptionApi.billingPortal,
    onSuccess: ({ portalUrl }) => {
      window.location.href = portalUrl;
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (isLoading) return <PageSkeleton />;

  const expired = state === 'EXPIRED';
  // Every billing field is null for a seat holder, so this is the safe gate.
  const ownsBilling = subscription.source === 'OWN';

  // The catalog carries a row per (interval, seats) combination.
  const visible = (catalog?.plans ?? []).filter(
    (plan) => plan.tier === 'FREE' || (plan.interval === interval && plan.seats === seats),
  );
  const proPlan = visible.find((plan) => plan.tier === 'PRO');

  const needsBeneficiaries = seats > 1;
  const readyToCheckout =
    !needsBeneficiaries ||
    (beneficiariesValid && beneficiaries.filter(Boolean).length === seats - 1);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Card
        className="flex flex-wrap items-center gap-4"
        style={{ background: 'linear-gradient(120deg, var(--hero-1), var(--surface-2))' }}
      >
        <div className="flex flex-col gap-1">
          <CardLabel>Current plan</CardLabel>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-display text-3xl font-bold">
              {state === 'PRO' ? 'Pro' : expired ? 'Pro (expired)' : 'Free'}
            </span>
            {subscription.amount && subscription.currency ? (
              <span className="text-sm font-semibold text-muted">
                {formatMoney(subscription.amount, subscription.currency)}
                {subscription.interval === 'QUARTERLY' ? '/quarter' : '/mo'}
              </span>
            ) : null}
            {subscription.seatCount > 1 ? (
              <span className="rounded-full bg-surface-4 px-2.5 py-1 text-[11px] font-bold text-violet-ink">
                {subscription.seatCount} seats
              </span>
            ) : null}
          </div>

          <span className="text-xs text-muted">
            {subscription.seat
              ? `Provided by ${subscription.seat.providerName} — they can end it, and they cannot see your board.${
                  subscription.seat.endsAt
                    ? ` Ends ${formatDate(subscription.seat.endsAt, 'd MMM yyyy')}.`
                    : ''
                }`
              : expired
                ? 'Your board is readable. Renew to start adding again.'
                : subscription.renewsAt
                  ? `${subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'} ${formatDate(subscription.renewsAt, 'd MMM yyyy')}`
                  : 'Free forever, no card needed.'}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          {subscription.seatCount > 1 && ownsBilling ? (
            <Link href="/plan/seats">
              <Button variant="outline" icon={<Users size={16} />}>
                Manage seats
              </Button>
            </Link>
          ) : null}
          <Link href="/plan/transactions">
            <Button variant="outline" icon={<Receipt size={16} />}>
              Receipts
            </Button>
          </Link>
          {state !== 'FREE' && ownsBilling ? (
            <Button
              variant="outline"
              icon={<CreditCard size={16} />}
              loading={billingPortal.isPending}
              onClick={() => billingPortal.mutate()}
            >
              Manage billing
            </Button>
          ) : null}
        </div>
      </Card>

      {!ownsBilling ? null : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <CardLabel>All plans</CardLabel>
            <RegionPicker />
            <SegmentedControl
              className="ml-auto"
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'QUARTERLY', label: 'Quarterly' },
              ]}
              value={interval}
              onChange={setInterval}
            />
          </div>

          <Card className="flex flex-col gap-3">
            <CardLabel>Who is this for</CardLabel>
            <SeatSelector
              maxSeats={catalog?.maxSeats ?? 3}
              value={seats}
              onChange={(count) => {
                setSeats(count);
                setBeneficiaries([]);
                setBeneficiariesValid(false);
              }}
            />

            {needsBeneficiaries ? (
              <BeneficiaryFields
                count={seats - 1}
                emails={beneficiaries}
                onChange={setBeneficiaries}
                onValidityChange={setBeneficiariesValid}
              />
            ) : null}

            {proPlan?.privacyNote ? (
              <p className="flex items-start gap-2.5 rounded-xl border border-dashed border-line-dash p-3 text-xs text-muted">
                <Shield size={15} className="mt-0.5 flex-none text-cyan-ink" />
                {proPlan.privacyNote}
              </p>
            ) : null}
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            {visible.map((plan) => {
              const current = plan.tier === subscription.tier && !expired;

              return (
                <PlanCard
                  key={`${plan.tier}-${plan.interval}-${plan.seats}`}
                  plan={plan}
                  current={current}
                  action={
                    plan.tier === 'PRO' ? (
                      <Button
                        variant="accent"
                        size="lg"
                        className="w-full"
                        disabled={current || !readyToCheckout}
                        loading={checkout.isPending}
                        onClick={() => checkout.mutate()}
                      >
                        {current ? 'Current plan' : expired ? 'Renew Pro' : 'Upgrade to Pro'}
                      </Button>
                    ) : (
                      <Button variant="outline" size="lg" className="w-full" disabled={current}>
                        {current ? 'Current plan' : 'Switch to Free'}
                      </Button>
                    )
                  }
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
