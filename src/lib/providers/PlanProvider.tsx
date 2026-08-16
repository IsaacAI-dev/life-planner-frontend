'use client';

import { useQuery } from '@tanstack/react-query';
import { createContext, use, type ReactNode } from 'react';
import { subscriptionApi } from '@/lib/api/subscription';
import type { Subscription } from '@/lib/types';

/**
 * Every screen gates on plan state, so it is resolved once here from
 * GET /subscription — the only endpoint the gating layer reads. Limits and
 * usage arrive together, so a quota can be rendered without a second call.
 */

export type PlanState = 'FREE' | 'PRO' | 'EXPIRED';

/** Used only while the first request is in flight. */
const LOADING_FALLBACK: Subscription = {
  tier: 'FREE',
  status: 'ACTIVE',
  interval: null,
  currency: 'NGN',
  amount: 0,
  seatCount: 1,
  source: 'OWN',
  seat: null,
  renewsAt: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  provider: null,
  platform: null,
  limits: {
    activitiesPerWeek: null,
    goals: null,
    chatEnabled: false,
    voiceNotesEnabled: false,
    mealPlansEnabled: false,
    supportChatEnabled: true,
  },
  usage: { activitiesThisWeek: 0, goals: 0 },
};

interface PlanValue {
  subscription: Subscription;
  state: PlanState;
  loading: boolean;
  canAddActivity: boolean;
  canAddGoal: boolean;
  activitiesLeft: number | null;
  goalsLeft: number | null;
}

const PlanContext = createContext<PlanValue | null>(null);

function stateOf(subscription: Subscription): PlanState {
  if (subscription.status === 'EXPIRED') return 'EXPIRED';
  return subscription.tier;
}

function remaining(limit: number | null, used: number): number | null {
  return limit === null ? null : Math.max(0, limit - used);
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.current,
    staleTime: 60_000,
  });

  const subscription = data ?? LOADING_FALLBACK;
  const { limits, usage } = subscription;

  const activitiesLeft = remaining(limits.activitiesPerWeek, usage.activitiesThisWeek);
  const goalsLeft = remaining(limits.goals, usage.goals);

  return (
    <PlanContext
      value={{
        subscription,
        state: stateOf(subscription),
        loading: isPending,
        canAddActivity: activitiesLeft === null || activitiesLeft > 0,
        canAddGoal: goalsLeft === null || goalsLeft > 0,
        activitiesLeft,
        goalsLeft,
      }}
    >
      {children}
    </PlanContext>
  );
}

export function usePlan(): PlanValue {
  const value = use(PlanContext);
  if (!value) throw new Error('usePlan must be used inside PlanProvider');
  return value;
}
