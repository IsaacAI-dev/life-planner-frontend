'use client';

import { useRouter } from 'next/navigation';
import { Infinity as InfinityIcon, Lock, MessagesSquare, Utensils, Zap } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { usePlan } from '@/lib/providers/PlanProvider';
import { formatMoney } from '@/lib/format';

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  /** What the person just tried to do, so the copy can name it. */
  reason: 'activities' | 'goals' | 'chats';
}

const COPY = {
  activities: { eyebrow: 'Activity limit reached', title: "You've used all five activities this week" },
  goals: { eyebrow: 'Goal limit reached', title: "You've used all three goals" },
  chats: { eyebrow: 'Chats are part of Pro', title: 'Messaging your coach needs Pro' },
};

const BENEFITS = [
  { icon: InfinityIcon, label: 'Unlimited activities and goals' },
  { icon: MessagesSquare, label: 'Chats and voice notes with your coach' },
  { icon: Utensils, label: 'Fitness Assistant and meal plans' },
];

export function UpgradeDialog({ open, onClose, reason }: UpgradeDialogProps) {
  const router = useRouter();
  const { subscription, state } = usePlan();
  const { limits, usage } = subscription;
  const expired = state === 'EXPIRED';
  const copy = COPY[reason];

  return (
    <Dialog open={open} onClose={onClose} bare>
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex items-start gap-3">
          <span
            className="flex size-10 flex-none items-center justify-center rounded-xl"
            style={{ background: 'rgba(240,169,59,0.16)', color: 'var(--amber-ink)' }}
          >
            {expired ? <Lock size={20} /> : <Zap size={20} />}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-[0.1em] text-amber-ink uppercase">
              {expired ? 'Plan expired' : copy.eyebrow}
            </span>
            <h2 className="font-display text-2xl leading-tight font-semibold">
              {expired ? 'Your Pro plan has ended' : copy.title}
            </h2>
          </div>
        </div>

        <p className="text-sm text-muted">
          {expired
            ? 'Your board is safe and still readable. Renew to start adding activities and messaging your coach again.'
            : 'Pro removes the cap — plan as many activities and goals as your week actually needs, and keep your coach in the loop.'}
        </p>

        {reason === 'activities' && limits.activitiesPerWeek ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between text-xs font-bold">
              <span className="text-muted">Activities this week</span>
              <span>
                {usage.activitiesThisWeek} of {limits.activitiesPerWeek}
              </span>
            </div>
            <Progress
              value={usage.activitiesThisWeek}
              max={limits.activitiesPerWeek}
              color="linear-gradient(90deg,#F0A93B,#F472B6)"
            />
          </div>
        ) : null}

        <ul className="flex flex-col gap-2.5">
          {BENEFITS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm font-semibold text-text-2">
              <Icon size={18} className="text-violet-ink" />
              {label}
            </li>
          ))}
        </ul>

        <Button
          variant="accent"
          size="lg"
          onClick={() => {
            onClose();
            router.push('/plan');
          }}
        >
          {expired ? 'Renew Pro' : `Upgrade to Pro · ${formatMoney(4500)}/mo`}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Not now
        </Button>

        <p className="text-center text-xs text-muted-3">
          Support is always available, on every plan.
        </p>
      </div>
    </Dialog>
  );
}
