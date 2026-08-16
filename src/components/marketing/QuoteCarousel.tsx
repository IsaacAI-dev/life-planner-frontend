'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { publicApi } from '@/lib/api/public';
import { ImageSlot } from '@/components/marketing/ImageSlot';
import { Reveal } from '@/components/marketing/Reveal';
import { QUOTES } from '@/lib/marketing/content';

const AUTO_ADVANCE_MS = 6800;

export function QuoteCarousel() {
  const [index, setIndex] = useState(0);
  const { data: assets } = useQuery({ queryKey: ['marketing-assets'], queryFn: publicApi.marketingAssets });

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % QUOTES.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto mt-16 max-w-[1180px] px-6 sm:mt-24 lg:mt-28">
      <Reveal className="mb-5.5 flex flex-wrap items-end gap-5 sm:mb-7.5">
        <h2
          className="font-display text-[clamp(26px,3.4vw,40px)] leading-[1.12] font-semibold"
          style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
        >
          People who stopped dreading Sunday.
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((current) => (current - 1 + QUOTES.length) % QUOTES.length)}
            aria-label="Previous quote"
            className="flex size-10 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--lp-line-str)', background: 'var(--lp-surf)', color: 'var(--lp-tx-2)' }}
          >
            <ArrowLeft size={19} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % QUOTES.length)}
            aria-label="Next quote"
            className="flex size-10 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--lp-line-str)', background: 'var(--lp-surf)', color: 'var(--lp-tx-2)' }}
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </Reveal>

      <Reveal
        className="overflow-hidden rounded-[18px] border"
        style={{ borderColor: 'var(--lp-line-2)', background: 'var(--lp-surf)' }}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${index * 100}%)`, transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)' }}
          >
            {QUOTES.map((quote) => (
              <figure key={quote.name} className="flex w-full flex-none flex-col gap-5.5 p-7 sm:p-13">
                <span className="font-display text-[44px] leading-[0.6]" style={{ color: 'var(--lp-ac)' }}>
                  &ldquo;
                </span>
                <blockquote
                  className="max-w-205 font-display text-[clamp(19px,2.3vw,27px)] leading-[1.36] font-semibold text-pretty"
                  style={{ color: 'var(--lp-tx)', letterSpacing: '-0.015em' }}
                >
                  {quote.text}
                </blockquote>
                <figcaption className="flex items-center gap-3.25">
                  <span
                    className="size-11 flex-none overflow-hidden rounded-full"
                    style={{ background: 'var(--lp-surf-3)', border: '1px solid var(--lp-line-2)' }}
                  >
                    <ImageSlot
                      placeholder="Portrait"
                      shape="circle"
                      src={assets?.testimonialPortraits.find((portrait) => portrait.name === quote.name)?.imageUrl}
                    />
                  </span>
                  <span className="flex flex-col gap-0.25">
                    <span className="text-[15px] font-bold" style={{ color: 'var(--lp-tx)' }}>
                      {quote.name}
                    </span>
                    <span className="text-[13.5px]" style={{ color: 'var(--lp-tx-3)' }}>
                      {quote.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.75 px-7 pb-6.5 sm:px-13">
          {QUOTES.map((quote, dotIndex) => (
            <button
              key={quote.name}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`Show quote from ${quote.name}`}
              className="h-2 rounded-full transition-[width,background] duration-300"
              style={{
                width: dotIndex === index ? 24 : 8,
                background: dotIndex === index ? 'var(--lp-ac)' : 'var(--lp-line-str)',
              }}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
