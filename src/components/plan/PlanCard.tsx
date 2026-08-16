'use client';

import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { formatMoney } from '@/lib/format';
import type { PlanOption } from '@/lib/types';

interface PlanCardProps {
  plan: PlanOption;
  /** Marked "Current" on the signed-in page; never on the landing page. */
  current?: boolean;
  action?: ReactNode;
}

/**
 * Shared by the landing page and the signed-in plan page — the two catalogs are
 * the same shape, so the pricing cannot read differently before and after signup.
 * `perSeatAmount` and `savingPercent` are computed server-side against the solo
 * row, so nothing here derives a discount.
 */
export function PlanCard({ plan, current = false, action }: PlanCardProps) {
  return (
    <Card
      className="flex flex-col gap-4"
      style={plan.highlight ? { borderColor: 'var(--violet-ink-2)' } : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-xl font-semibold">{plan.name}</span>
        {current ? (
          <span className="rounded-full bg-surface-4 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-muted uppercase">
            Current
          </span>
        ) : null}
        {plan.highlight ? (
          <span className="ml-auto rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-on-accent uppercase">
            Most chosen
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-4xl font-bold">
            {formatMoney(plan.amount, plan.currency)}
          </span>
          <span className="text-sm text-muted">
            {plan.amount === 0 ? 'forever' : plan.interval === 'QUARTERLY' ? '/quarter' : '/mo'}
          </span>
        </div>

        {plan.seats > 1 && plan.perSeatAmount ? (
          <span className="text-xs font-semibold text-violet-ink">
            {formatMoney(plan.perSeatAmount, plan.currency)} each
            {plan.savingPercent ? ` · saves ${plan.savingPercent}%` : ''}
          </span>
        ) : null}
      </div>

      {plan.description ? <p className="text-sm text-muted">{plan.description}</p> : null}

      <ul className="flex flex-col gap-2.5">
        {plan.features.map((feature) => {
          const excluded = feature.toLowerCase().startsWith('no ');

          return (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              {excluded ? (
                <X size={17} className="mt-0.5 flex-none text-muted-3" />
              ) : (
                <Check size={17} className="mt-0.5 flex-none text-green-ink" />
              )}
              <span className={excluded ? 'text-muted-3' : 'text-text-3'}>{feature}</span>
            </li>
          );
        })}
      </ul>

      {plan.privacyNote ? (
        <p className="text-xs text-muted-3">{plan.privacyNote}</p>
      ) : null}

      {action ? <div className="mt-auto pt-1">{action}</div> : null}
    </Card>
  );
}
