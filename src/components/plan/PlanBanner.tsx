'use client';

import Link from 'next/link';
import { Lock, Zap } from 'lucide-react';
import { usePlan } from '@/lib/providers/PlanProvider';

/** The quota pill shown beside the Today greeting on Free and expired plans. */
export function PlanBanner() {
  const { state, subscription } = usePlan();

  if (state === 'PRO') return null;

  const expired = state === 'EXPIRED';
  const limit = subscription.limits.activitiesPerWeek;

  return (
    <Link
      href="/plan"
      className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold"
      style={{
        borderColor: 'rgba(240,169,59,0.45)',
        background: 'rgba(240,169,59,0.12)',
        color: 'var(--amber-ink)',
      }}
    >
      {expired ? <Lock size={15} /> : <Zap size={15} />}
      {expired
        ? 'Adding is paused'
        : `${subscription.usage.activitiesThisWeek} / ${limit ?? 0} activities this week`}
    </Link>
  );
}
