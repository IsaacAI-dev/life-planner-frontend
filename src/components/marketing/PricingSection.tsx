'use client';

import { useQuery } from '@tanstack/react-query';
import { Check, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { publicApi } from '@/lib/api/public';
import { Reveal } from '@/components/marketing/Reveal';
import { seatLabel } from '@/components/plan/SeatSelector';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatMoney } from '@/lib/format';
import { FREE_PLAN_FEATURES } from '@/lib/marketing/content';
import type { BillingInterval } from '@/lib/types';

const COUNTRIES = [
  { code: 'NG', label: 'Nigeria' },
  { code: 'KE', label: 'Kenya' },
  { code: 'GH', label: 'Ghana' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'DE', label: 'Germany' },
];

/**
 * The mock only shows a solo Free/Plus pair — no group pricing exists in the
 * design. Freestyled here on top of the real catalog: a seat picker sits above
 * the two cards, and choosing 2 or 3 swaps in that tier's live price, so the
 * "save X% each" line is never invented client-side.
 */
export function PricingSection() {
  const [interval, setInterval] = useState<BillingInterval>('MONTHLY');
  const [seats, setSeats] = useState(1);
  const [country, setCountry] = useState<string | undefined>();

  const { data: catalog, isPending, isError } = useQuery({
    queryKey: ['public-plans', country],
    queryFn: () => publicApi.plans(country),
  });

  const freePlan = catalog?.plans.find((plan) => plan.tier === 'FREE');
  const proPlan = catalog?.plans.find(
    (plan) => plan.tier === 'PRO' && plan.interval === interval && plan.seats === seats,
  );
  const monthlyPro = catalog?.plans.find(
    (plan) => plan.tier === 'PRO' && plan.interval === 'MONTHLY' && plan.seats === seats,
  );
  const quarterlyPro = catalog?.plans.find(
    (plan) => plan.tier === 'PRO' && plan.interval === 'QUARTERLY' && plan.seats === seats,
  );
  const savingVsMonthly =
    monthlyPro && quarterlyPro ? monthlyPro.amount * 3 - quarterlyPro.amount : 0;

  const chosenRegion = catalog?.resolvedFrom === 'QUERY';

  return (
    <section id="lp-pricing" className="mx-auto mt-16 max-w-[1180px] scroll-mt-24 px-6 sm:mt-24 lg:mt-28">
      <Reveal className="mb-6.5 flex flex-col items-center gap-4 text-center sm:mb-10">
        <h2
          className="font-display text-[clamp(28px,3.8vw,44px)] leading-[1.12] font-semibold"
          style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
        >
          One price. No tiers of guilt.
        </h2>
        <p className="max-w-135 text-[16.5px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
          The free plan is a real plan, not a trial. Plus exists for people who share boards and
          want the whole picture.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <label className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: 'var(--lp-line-2)', color: 'var(--lp-tx-3)' }}>
            <Globe size={13} />
            <select
              value={country ?? catalog?.region ?? ''}
              onChange={(event) => setCountry(event.target.value)}
              className="bg-transparent outline-none"
              style={{ color: 'var(--lp-tx-2)' }}
            >
              {catalog?.region ? null : <option value="">Choose country</option>}
              {COUNTRIES.map((option) => (
                <option
                  key={option.code}
                  value={option.code}
                  style={{ background: 'var(--lp-surf)', color: 'var(--lp-tx)' }}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-flex gap-1 rounded-full border p-1" style={{ borderColor: 'var(--lp-line-2)', background: 'var(--lp-surf)' }}>
            <button
              type="button"
              onClick={() => setInterval('MONTHLY')}
              className="rounded-full px-4.5 py-2 font-display text-sm font-semibold whitespace-nowrap"
              style={{
                background: interval === 'MONTHLY' ? 'var(--lp-grad)' : 'transparent',
                color: interval === 'MONTHLY' ? '#141019' : 'var(--lp-tx-2)',
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval('QUARTERLY')}
              className="rounded-full px-4.5 py-2 font-display text-sm font-semibold whitespace-nowrap"
              style={{
                background: interval === 'QUARTERLY' ? 'var(--lp-grad)' : 'transparent',
                color: interval === 'QUARTERLY' ? '#141019' : 'var(--lp-tx-2)',
              }}
            >
              3 months{savingVsMonthly > 0 && catalog ? ` · save ${formatMoney(savingVsMonthly, catalog.currency)}` : ''}
            </button>
          </div>
        </div>

        {catalog && catalog.maxSeats > 1 ? (
          <div className="inline-flex gap-1 rounded-full border p-1" style={{ borderColor: 'var(--lp-line-2)', background: 'var(--lp-surf)' }}>
            {Array.from({ length: catalog.maxSeats }, (_, i) => i + 1).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setSeats(count)}
                className="rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap"
                style={{
                  background: seats === count ? 'var(--lp-surf-3)' : 'transparent',
                  color: seats === count ? 'var(--lp-tx)' : 'var(--lp-tx-3)',
                  border: seats === count ? '1px solid var(--lp-ac)' : '1px solid transparent',
                }}
              >
                {seatLabel(count)}
              </button>
            ))}
          </div>
        ) : null}

        <p className="text-xs" style={{ color: 'var(--lp-tx-4)' }}>
          {chosenRegion
            ? `Prices shown in ${catalog?.currency} for ${catalog?.country}.`
            : `Prices shown in ${catalog?.currency ?? 'USD'} — pick your country above for local pricing.`}
        </p>
      </Reveal>

      {isError ? (
        <Reveal
          className="mx-auto max-w-135 rounded-[18px] border px-7 py-9 text-center"
          style={{ borderColor: 'var(--lp-line-2)', background: 'var(--lp-surf)' }}
        >
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--lp-tx-2)' }}>
            Live pricing didn&apos;t load just now. Free is always free, and Plus pricing is shown
            the moment you start an account.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-[15px] font-semibold"
            style={{ background: 'var(--lp-grad)', color: '#141019' }}
          >
            Start free
          </Link>
        </Reveal>
      ) : isPending || !catalog ? (
        <div className="mx-auto grid max-w-225 grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4.5">
          <Skeleton className="h-125" />
          <Skeleton className="h-125" />
        </div>
      ) : (
        <Reveal className="mx-auto grid max-w-225 grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4.5">
          <div
            className="flex flex-col gap-4.5 rounded-[26px] border p-7 sm:p-8.5"
            style={{ background: 'var(--lp-surf)', borderColor: 'var(--lp-line-2)' }}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-[15px] font-bold tracking-[0.06em] uppercase" style={{ color: 'var(--lp-tx-3)' }}>
                Free
              </span>
              <span className="font-display text-[clamp(34px,4vw,46px)] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}>
                {freePlan ? formatMoney(0, freePlan.currency) : '$0'}
              </span>
              <span className="text-[14.5px]" style={{ color: 'var(--lp-tx-3)' }}>
                Forever. Not a trial.
              </span>
            </div>
            <div className="h-px" style={{ background: 'var(--lp-line-2)' }} />
            <ul className="flex flex-1 flex-col gap-2.75">
              {(freePlan?.features ?? FREE_PLAN_FEATURES).map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[15px]" style={{ color: 'var(--lp-tx-2)' }}>
                  <Check size={19} className="mt-0.5 flex-none" style={{ color: 'var(--lp-tx-3)' }} />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full border py-3.25 font-display text-[15px] font-semibold"
              style={{ borderColor: 'var(--lp-line-str)', color: 'var(--lp-tx)' }}
            >
              Start free
            </Link>
          </div>

          <div
            className="relative flex flex-col gap-4.5 rounded-[26px] border p-7 sm:p-8.5"
            style={{ background: 'var(--lp-surf-2)', borderColor: 'var(--lp-ac)', boxShadow: 'var(--lp-glow)' }}
          >
            {proPlan?.highlight ? (
              <span
                className="absolute -top-3 left-7 rounded-full px-3 py-1 font-display text-[11.5px] font-bold tracking-[0.07em] uppercase sm:left-8.5"
                style={{ background: 'var(--lp-grad)', color: '#141019' }}
              >
                Most chosen
              </span>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <span className="font-display text-[15px] font-bold tracking-[0.06em] uppercase" style={{ color: 'var(--lp-ac)' }}>
                Plus{seats > 1 ? ` · ${seatLabel(seats)}` : ''}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-display text-[clamp(34px,4vw,46px)] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}>
                  {proPlan ? formatMoney(proPlan.amount, proPlan.currency) : '—'}
                </span>
                <span className="text-[15px]" style={{ color: 'var(--lp-tx-3)' }}>
                  {interval === 'QUARTERLY' ? '/ 3 months' : '/ month'}
                </span>
              </span>
              <span className="text-[14.5px]" style={{ color: 'var(--lp-tx-3)' }}>
                {seats > 1 && proPlan?.perSeatAmount
                  ? `${formatMoney(proPlan.perSeatAmount, proPlan.currency)} each${proPlan.savingPercent ? ` · saves ${proPlan.savingPercent}%` : ''}`
                  : interval === 'QUARTERLY'
                    ? `Works out at ${quarterlyPro ? formatMoney(quarterlyPro.amount / 3, quarterlyPro.currency) : '—'} a month.`
                    : 'Billed monthly. Cancel any time.'}
              </span>
            </div>
            <div className="h-px" style={{ background: 'var(--lp-line-2)' }} />
            <ul className="flex flex-1 flex-col gap-2.75">
              {proPlan?.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[15px]" style={{ color: 'var(--lp-tx-2)' }}>
                  <Check size={19} className="mt-0.5 flex-none" style={{ color: 'var(--lp-ac)' }} />
                  {feature}
                </li>
              ))}
            </ul>
            {proPlan?.privacyNote && seats > 1 ? (
              <p className="text-xs" style={{ color: 'var(--lp-tx-4)' }}>
                {proPlan.privacyNote}
              </p>
            ) : null}
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full py-3.25 font-display text-[15px] font-semibold"
              style={{ background: 'var(--lp-grad)', color: '#141019' }}
            >
              Get Plus
            </Link>
          </div>
        </Reveal>
      )}
    </section>
  );
}
