'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Briefcase, Clock3, Coins, Users2 } from 'lucide-react';
import Link from 'next/link';
import { publicApi } from '@/lib/api/public';
import { Kicker } from '@/components/marketing/Kicker';
import { Skeleton } from '@/components/ui/Skeleton';
import { CAREERS } from '@/lib/marketing/content';

const PERK_ICONS = { schedule: Clock3, groups: Users2, payments: Coins } as const;

/**
 * Roles are the one piece of this page that genuinely has to come from the
 * backend — unlike the rest of the copy, presenting stale or fake job
 * listings would be actively misleading, so there is no static fallback here.
 * Loading, some-roles and zero-roles are three distinct, real states.
 */
export function CareersContent() {
  const { data: roles, isPending } = useQuery({
    queryKey: ['career-roles'],
    queryFn: publicApi.careerRoles,
  });

  return (
    <main className="mx-auto max-w-225 px-6 pt-11 sm:pt-21">
      <Link
        href="/"
        className="mb-6.5 flex w-fit items-center gap-1.75 text-sm font-semibold"
        style={{ color: 'var(--lp-tx-3)' }}
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>

      <Kicker>{CAREERS.kicker}</Kicker>
      <h1
        className="mt-3.5 font-display text-[clamp(34px,5vw,56px)] leading-[1.08] font-semibold"
        style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
      >
        {/* "Four open roles" is only true while it's true — once roles are live,
            the count has to track them or the hero contradicts the list below. */}
        Nine people.{' '}
        {isPending
          ? 'Open roles.'
          : roles && roles.length > 0
            ? `${roles.length} open role${roles.length === 1 ? '' : 's'}.`
            : 'Openings when they\u2019re right.'}
      </h1>
      <p className="mt-5 max-w-165 text-lg leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
        {CAREERS.intro}
      </p>

      <div className="my-8 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4 sm:my-12">
        {CAREERS.perks.map((perk) => {
          const Icon = PERK_ICONS[perk.icon as keyof typeof PERK_ICONS];
          return (
            <div
              key={perk.title}
              className="flex flex-col gap-2.25 rounded-[18px] border p-5.5"
              style={{ background: 'var(--lp-surf)', borderColor: 'var(--lp-line-2)' }}
            >
              <Icon size={24} style={{ color: 'var(--lp-ac)' }} />
              <h3 className="font-display text-[17.5px] font-semibold" style={{ color: 'var(--lp-tx)' }}>
                {perk.title}
              </h3>
              <p className="text-[14.5px] leading-relaxed" style={{ color: 'var(--lp-tx-2)' }}>
                {perk.body}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="mb-1.5 font-display text-[clamp(23px,2.8vw,31px)] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}>
        {CAREERS.rolesHeading}
      </h2>
      <p className="mb-5 text-[15.5px]" style={{ color: 'var(--lp-tx-3)' }}>
        {CAREERS.rolesSub}
      </p>

      {isPending ? (
        <div className="mb-9 flex flex-col gap-3 sm:mb-14">
          <Skeleton className="h-30" />
          <Skeleton className="h-30" />
          <Skeleton className="h-30" />
        </div>
      ) : roles && roles.length > 0 ? (
        <div className="mb-9 flex flex-col gap-3 sm:mb-14">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-wrap items-center gap-5 rounded-[18px] border px-6 py-5.5"
              style={{ background: 'var(--lp-surf)', borderColor: 'var(--lp-line-2)' }}
            >
              <div className="flex min-w-65 flex-1 flex-col gap-1.75">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-[19px] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.01em' }}>
                    {role.title}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.75 text-[11.5px] font-bold tracking-[0.06em] uppercase"
                    style={{ background: 'var(--lp-pill)', border: '1px solid var(--lp-pill-bd)', color: 'var(--lp-ac)' }}
                  >
                    {role.department}
                  </span>
                </div>
                <p className="max-w-110 text-[14.5px] leading-relaxed" style={{ color: 'var(--lp-tx-2)' }}>
                  {role.body}
                </p>
                <div className="text-[13px]" style={{ color: 'var(--lp-tx-4)' }}>
                  {role.location} · {role.employmentType} · {role.compensation}
                </div>
              </div>
              <Link
                href={role.applyUrl ?? '/#lp-contact'}
                className="ml-auto inline-flex items-center gap-1.75 rounded-full border px-4.5 py-2.75 text-[14.5px] font-semibold"
                style={{ borderColor: 'var(--lp-line-str)', color: 'var(--lp-tx)' }}
              >
                Apply
                <ArrowRight size={17} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="mb-9 flex flex-col items-center gap-3 rounded-[18px] border border-dashed px-6 py-12 text-center sm:mb-14"
          style={{ borderColor: 'var(--lp-line-str)' }}
        >
          <span className="flex size-12 items-center justify-center rounded-2xl" style={{ background: 'var(--lp-pill)' }}>
            <Briefcase size={22} style={{ color: 'var(--lp-ac)' }} />
          </span>
          <span className="font-display text-lg font-semibold" style={{ color: 'var(--lp-tx)' }}>
            No open roles right now
          </span>
          <p className="max-w-100 text-[14.5px] leading-relaxed" style={{ color: 'var(--lp-tx-2)' }}>
            We hire slowly, and the timing just isn&apos;t right at the moment. Send a note anyway — two
            of the nine started exactly that way.
          </p>
          <Link
            href="/#lp-contact"
            className="mt-1 inline-flex items-center gap-1.75 rounded-full px-4.5 py-2.5 font-display text-sm font-semibold"
            style={{ background: 'var(--lp-grad)', color: '#141019' }}
          >
            Send us a note
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <h2 className="mb-5 font-display text-[clamp(23px,2.8vw,31px)] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}>
        {CAREERS.hiringHeading}
      </h2>
      <div
        className="mb-9 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-px overflow-hidden rounded-[18px] border sm:mb-14"
        style={{ background: 'var(--lp-line)', borderColor: 'var(--lp-line)' }}
      >
        {CAREERS.hiring.map((step) => (
          <div key={step.n} className="flex flex-col gap-2" style={{ background: 'var(--lp-surf)', padding: 22 }}>
            <div className="font-display text-[13px] font-bold tracking-[0.1em]" style={{ color: 'var(--lp-ac)' }}>
              {step.n}
            </div>
            <div className="font-display text-base font-semibold" style={{ color: 'var(--lp-tx)' }}>
              {step.title}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-tx-2)' }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <div
        className="relative mb-14 flex flex-col items-start gap-3.5 overflow-hidden rounded-[26px] border p-7 sm:p-11"
        style={{ background: 'var(--lp-surf-2)', borderColor: 'var(--lp-line-2)' }}
      >
        <div
          className="pointer-events-none absolute -top-[40%] -left-[20%] h-full w-[80%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(50% 50% at 30% 40%, rgba(167,139,250,.18), transparent 70%)' }}
          aria-hidden="true"
        />
        <h2
          className="relative max-w-110 font-display text-[clamp(23px,3vw,33px)] leading-[1.14] font-semibold"
          style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
        >
          {CAREERS.closing.h2}
        </h2>
        <p className="relative max-w-115 text-base leading-relaxed" style={{ color: 'var(--lp-tx-2)' }}>
          {CAREERS.closing.body}
        </p>
        <Link
          href="/#lp-contact"
          className="relative inline-flex items-center gap-2 rounded-full px-5.5 py-3.25 font-display text-[15px] font-semibold"
          style={{ background: 'var(--lp-grad)', color: '#141019' }}
        >
          {CAREERS.closing.cta}
          <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}
