'use client';

import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { publicApi } from '@/lib/api/public';
import { ImageSlot } from '@/components/marketing/ImageSlot';
import { Kicker } from '@/components/marketing/Kicker';
import { Reveal } from '@/components/marketing/Reveal';
import { SHOTS } from '@/lib/marketing/content';

const AUTO_ADVANCE_MS = 5200;
/** Matches SHOTS by position — see MARKETING_ENDPOINTS.md for the key list. */
const SHOT_KEYS = ['today', 'calendar', 'goals', 'boards', 'chat'];

export function ScreensCarousel() {
  const [index, setIndex] = useState(0);
  const { data: assets } = useQuery({ queryKey: ['marketing-assets'], queryFn: publicApi.marketingAssets });
  const shotImage = assets?.screens.find((shot) => shot.key === SHOT_KEYS[index])?.imageUrl;

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % SHOTS.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  const shot = SHOTS[index];

  return (
    <section id="lp-screens" className="mx-auto mt-16 max-w-[1180px] scroll-mt-24 px-6 sm:mt-24 lg:mt-28">
      <Reveal className="mb-6 flex flex-wrap items-end gap-6 sm:mb-8.5">
        <div className="flex max-w-140 flex-col gap-3.5">
          <Kicker>The screens</Kicker>
          <h2
            className="font-display text-[clamp(28px,3.8vw,44px)] leading-[1.12] font-semibold"
            style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
          >
            Have a proper look around.
          </h2>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((current) => (current - 1 + SHOTS.length) % SHOTS.length)}
            aria-label="Previous screen"
            className="flex size-10.5 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--lp-line-str)', background: 'var(--lp-surf)', color: 'var(--lp-tx-2)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % SHOTS.length)}
            aria-label="Next screen"
            className="flex size-10.5 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--lp-line-str)', background: 'var(--lp-surf)', color: 'var(--lp-tx-2)' }}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </Reveal>

      <Reveal
        className="overflow-hidden rounded-[26px] border"
        style={{ borderColor: 'var(--lp-line-2)', background: 'var(--lp-surf-2)', boxShadow: 'var(--lp-shadow)' }}
      >
        <div className="relative h-[clamp(360px,46vw,600px)]" style={{ background: 'var(--lp-surf-in)' }}>
          <AnimatePresence mode="sync">
            <motion.div
              key={shot.title}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <ImageSlot placeholder={shot.placeholder} src={shotImage} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="flex flex-wrap items-center gap-4.5 border-t px-5.5 py-4.5"
          style={{ borderColor: 'var(--lp-line)', background: 'var(--lp-surf)' }}
        >
          <div className="flex min-w-60 flex-col gap-0.5">
            <div className="font-display text-[17px] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.01em' }}>
              {shot.title}
            </div>
            <div className="text-sm" style={{ color: 'var(--lp-tx-3)' }}>
              {shot.blurb}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.75">
            {SHOTS.map((item, dotIndex) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Show ${item.title}`}
                className="h-2 rounded-full transition-[width,background] duration-300"
                style={{
                  width: dotIndex === index ? 24 : 8,
                  background: dotIndex === index ? 'var(--lp-ac)' : 'var(--lp-line-str)',
                }}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
