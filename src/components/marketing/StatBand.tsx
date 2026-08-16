'use client';

import { motion, useInView, useMotionValue, useReducedMotion, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { STATS } from '@/lib/marketing/content';

function formatStat(value: number, fmt: string): string {
  if (fmt === 'k') return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  if (fmt === 'm') return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (fmt === 'rating') return `${(value / 10).toFixed(1)} \u2605`;
  return String(value);
}

function StatValue({ to, fmt, suffix }: { to: number; fmt: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(formatStat(0, fmt));

  // The reduced-motion jump is a render, not a subscription — set it during
  // render rather than as a setState call inside the effect body.
  const target = reduce && inView ? formatStat(to, fmt) + (suffix ?? '') : null;

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(motionValue, to, {
      duration: 1.25,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (value) => setDisplay(formatStat(Math.round(value), fmt) + (suffix ?? '')),
    });
    return () => controls.stop();
  }, [inView, to, fmt, suffix, reduce, motionValue]);

  return <span ref={ref}>{target ?? display}</span>;
}

export function StatBand() {
  return (
    <section className="mx-auto mt-14 max-w-[1180px] px-6 sm:mt-18">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-px overflow-hidden rounded-[18px] border"
        style={{ background: 'var(--lp-line)', borderColor: 'var(--lp-line)' }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 px-6 py-6 sm:py-7.5" style={{ background: 'var(--lp-surf)' }}>
            <div
              className="font-display text-[clamp(28px,3.4vw,40px)] font-semibold"
              style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
            >
              <StatValue to={stat.to} fmt={stat.fmt} suffix={'suffix' in stat ? stat.suffix : undefined} />
            </div>
            <div className="text-[13.5px] font-semibold" style={{ color: 'var(--lp-tx-3)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
