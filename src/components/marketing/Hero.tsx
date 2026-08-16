'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ImageSlot } from '@/components/marketing/ImageSlot';
import { Reveal } from '@/components/marketing/Reveal';

export function Hero() {
  const { data: assets } = useQuery({ queryKey: ['marketing-assets'], queryFn: publicApi.marketingAssets });

  return (
    <section className="relative overflow-hidden px-6 pt-14 text-center sm:pt-20 lg:pt-26">
      <div
        className="pointer-events-none absolute -top-30 left-1/2 h-105 w-160 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,.3), transparent 68%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-220 flex-col items-center gap-5.5">
        <Reveal className="flex justify-center">
          <span
            className="inline-flex items-center gap-2.5 rounded-full py-1.5 pr-2 pl-3.5 text-[13px] font-semibold"
            style={{ background: 'var(--lp-pill)', border: '1px solid var(--lp-pill-bd)', color: 'var(--lp-tx-2)' }}
          >
            Shared boards are here — plan with a coach, a partner, or the whole house
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.75 text-xs"
              style={{ background: 'var(--lp-surf-3)', color: 'var(--lp-ac)' }}
            >
              New
              <ArrowRight size={13} />
            </span>
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h1
            className="font-display text-[clamp(40px,6.4vw,74px)] leading-[1.03] font-semibold text-balance"
            style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
          >
            Your whole life,
            <br />
            on one calm page.
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p
            className="max-w-155 text-[clamp(16px,1.7vw,19px)] leading-relaxed text-pretty"
            style={{ color: 'var(--lp-tx-2)' }}
          >
            Goals, habits, tasks, calendar and the people you answer to — together, in one quiet
            place. Life Planner makes today obvious and keeps the year ahead feeling possible.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full px-6.5 py-3.5 font-display text-base font-semibold whitespace-nowrap"
            style={{ background: 'var(--lp-grad)', color: '#141019', boxShadow: 'var(--lp-glow)' }}
          >
            Start free — no card
            <ArrowRight size={19} />
          </Link>
          <Link
            href="/#lp-screens"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 font-display text-base font-semibold whitespace-nowrap"
            style={{ borderColor: 'var(--lp-line-str)', color: 'var(--lp-tx)' }}
          >
            <PlayCircle size={19} />
            See it in motion
          </Link>
        </Reveal>

        <Reveal delay={0.2} className="flex items-center gap-2 text-[13px] font-semibold" >
          <span className="flex items-center gap-2" style={{ color: 'var(--lp-tx-4)' }}>
            <CheckCircle2 size={17} style={{ color: 'var(--lp-ac-2)' }} />
            Free forever tier · Cancel Plus any time · Your data stays yours
          </span>
        </Reveal>

        <Reveal delay={0.25} className="relative mt-10 w-full max-w-265 sm:mt-16">
          <div
            className="pointer-events-none absolute -inset-x-2.5 -top-7.5 -bottom-2.5 blur-2xl"
            style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(167,139,250,.24), transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="relative overflow-hidden rounded-[26px] border"
            style={{ borderColor: 'var(--lp-line-2)', background: 'var(--lp-surf)', boxShadow: 'var(--lp-shadow)' }}
          >
            <div
              className="flex h-10 items-center gap-2 border-b px-4"
              style={{ borderColor: 'var(--lp-line)', background: 'var(--lp-surf-2)' }}
            >
              <span className="size-2.5 rounded-full" style={{ background: '#F87171' }} />
              <span className="size-2.5 rounded-full" style={{ background: '#F0A93B' }} />
              <span className="size-2.5 rounded-full" style={{ background: '#5BE49B' }} />
              <span
                className="mx-auto rounded-full px-4 py-1 text-[11.5px] font-semibold"
                style={{ background: 'var(--lp-surf-in)', border: '1px solid var(--lp-line)', color: 'var(--lp-tx-4)' }}
              >
                app.lifeplanner.co / today
              </span>
            </div>
            <div className="h-90 sm:h-120 lg:h-155">
              <ImageSlot
                placeholder="Product screenshot or short screen-recording of the Today view"
                src={assets?.heroPreviewUrl}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
