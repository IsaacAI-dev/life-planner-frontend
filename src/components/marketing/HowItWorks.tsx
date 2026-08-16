import { Kicker } from '@/components/marketing/Kicker';
import { Reveal } from '@/components/marketing/Reveal';
import { HOW_IT_WORKS } from '@/lib/marketing/content';

export function HowItWorks() {
  return (
    <section id="lp-how" className="mx-auto mt-16 max-w-[1180px] scroll-mt-24 px-6 sm:mt-24 lg:mt-28">
      <Reveal className="mb-10 h-px sm:mb-16" style={{ background: 'var(--lp-rule)' }}>
        <span className="sr-only">.</span>
      </Reveal>

      <Reveal className="mb-7 flex max-w-155 flex-col gap-3.5 sm:mb-11">
        <Kicker>How it works</Kicker>
        <h2
          className="font-display text-[clamp(28px,3.8vw,44px)] leading-[1.12] font-semibold"
          style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
        >
          Fifteen minutes on Sunday. That&apos;s the whole ritual.
        </h2>
      </Reveal>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 sm:gap-8.5">
        {HOW_IT_WORKS.map((step, index) => (
          <Reveal key={step.step} delay={index * 0.06}>
            <div
              className="flex flex-col gap-3.5 border-t-2 pt-5.5"
              style={{ borderColor: index === 0 ? 'var(--lp-ac)' : 'var(--lp-line-str)' }}
            >
              <span className="font-display text-[13px] font-bold tracking-[0.14em]" style={{ color: 'var(--lp-tx-4)' }}>
                {step.step}
              </span>
              <h3
                className="font-display text-[22px] font-semibold"
                style={{ color: 'var(--lp-tx)', letterSpacing: '-0.015em' }}
              >
                {step.title}
              </h3>
              <p className="text-[15.5px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
