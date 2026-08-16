'use client';

import {
  CalendarClock,
  CheckSquare,
  Flag,
  Flame,
  MessagesSquare,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Kicker } from '@/components/marketing/Kicker';
import { Reveal } from '@/components/marketing/Reveal';
import { FEATURES } from '@/lib/marketing/content';

const ICONS: Record<string, LucideIcon> = {
  flag: Flag,
  local_fire_department: Flame,
  calendar_month: CalendarClock,
  checklist: CheckSquare,
  forum: MessagesSquare,
  group: Users,
};

export function FeaturesSection() {
  return (
    <section id="lp-features" className="mx-auto mt-16 max-w-[1180px] scroll-mt-24 px-6 sm:mt-24 lg:mt-28">
      <Reveal className="mb-7 flex max-w-165 flex-col gap-3.5 sm:mb-11">
        <Kicker>What&apos;s inside</Kicker>
        <h2
          className="font-display text-[clamp(28px,3.8vw,44px)] leading-[1.12] font-semibold"
          style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
        >
          Six pieces that finally talk to each other.
        </h2>
        <p className="text-[17px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
          Most tools give you a list. Life Planner connects the list to the week, the week to
          the goal, and the goal to the person who asked you about it.
        </p>
      </Reveal>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {FEATURES.map((feature, index) => {
          const Icon = ICONS[feature.icon];
          return (
            <Reveal key={feature.title} delay={index * 0.03}>
              <div
                className="group flex h-full flex-col gap-3 rounded-[18px] border p-6 transition-transform duration-200 hover:-translate-y-1"
                style={{ background: 'var(--lp-surf)', borderColor: 'var(--lp-line-2)' }}
              >
                <span
                  className="flex size-11 items-center justify-center rounded-xl"
                  style={{ background: 'var(--lp-pill)', border: '1px solid var(--lp-pill-bd)' }}
                >
                  <Icon size={23} style={{ color: 'var(--lp-ac)' }} />
                </span>
                <h3
                  className="font-display text-[19px] font-semibold"
                  style={{ color: 'var(--lp-tx)', letterSpacing: '-0.01em' }}
                >
                  {feature.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
                  {feature.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
