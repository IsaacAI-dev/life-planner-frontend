import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/marketing/Reveal';
import { CLOSING_CTA } from '@/lib/marketing/content';

export function ClosingCta() {
  return (
    <section className="mx-auto mt-16 max-w-[1180px] px-6 sm:mt-24 lg:mt-27">
      <Reveal
        className="relative flex flex-col items-center gap-4.5 overflow-hidden rounded-[26px] border px-6 py-10 text-center sm:px-14 sm:py-19"
        style={{ borderColor: 'var(--lp-line-2)', background: 'var(--lp-surf)' }}
      >
        <div
          className="pointer-events-none absolute -top-35 left-1/2 h-85 w-140 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,.3), transparent 68%)' }}
          aria-hidden="true"
        />
        <h2
          className="relative max-w-175 font-display text-[clamp(28px,4.2vw,50px)] leading-[1.08] font-semibold text-balance"
          style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
        >
          {CLOSING_CTA.h2}
        </h2>
        <p className="relative max-w-125 text-[17px] leading-relaxed" style={{ color: 'var(--lp-tx-2)' }}>
          {CLOSING_CTA.body}
        </p>
        <Link
          href="/sign-up"
          className="relative mt-1.5 inline-flex items-center gap-2 rounded-full px-7.5 py-4 font-display text-base font-semibold whitespace-nowrap"
          style={{ background: 'var(--lp-grad)', color: '#141019', boxShadow: 'var(--lp-glow)' }}
        >
          {CLOSING_CTA.cta}
          <ArrowRight size={19} />
        </Link>
      </Reveal>
    </section>
  );
}
