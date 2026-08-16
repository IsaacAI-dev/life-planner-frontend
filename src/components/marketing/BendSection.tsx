'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ImageSlot } from '@/components/marketing/ImageSlot';
import { Kicker } from '@/components/marketing/Kicker';
import { Reveal } from '@/components/marketing/Reveal';
import { BEND } from '@/lib/marketing/content';

export function BendSection() {
  const { data: assets } = useQuery({ queryKey: ['marketing-assets'], queryFn: publicApi.marketingAssets });

  return (
    <section className="mx-auto mt-16 max-w-[1180px] px-6 sm:mt-24 lg:mt-28">
      <Reveal className="mb-10 h-px sm:mb-16" style={{ background: 'var(--lp-rule)' }}>
        <span className="sr-only">.</span>
      </Reveal>

      <Reveal className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-8 sm:gap-14">
        <div className="relative">
          <div
            className="overflow-hidden rounded-[18px] border"
            style={{ borderColor: 'var(--lp-line-2)', aspectRatio: '4 / 3', background: 'var(--lp-surf-in)' }}
          >
            <ImageSlot
              placeholder="Photo: someone planning their week — mug, notebook, laptop. Dark background works best."
              src={assets?.bendPrimaryUrl}
            />
          </div>
          <div
            className="absolute -right-3.5 -bottom-5.5 w-[46%] animate-[lpFloat_7s_ease-in-out_infinite] overflow-hidden rounded-[18px] border"
            style={{ borderColor: 'var(--lp-line-2)', boxShadow: 'var(--lp-shadow)', aspectRatio: '1 / 1', background: 'var(--lp-surf-in)' }}
          >
            <ImageSlot placeholder="Detail photo: hands, pen, phone" src={assets?.bendDetailUrl} />
          </div>
        </div>

        <div className="flex max-w-130 flex-col gap-4">
          <Kicker>{BEND.kicker}</Kicker>
          <h2
            className="font-display text-[clamp(26px,3.4vw,40px)] leading-[1.14] font-semibold"
            style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
          >
            {BEND.h2}
          </h2>
          <p className="text-[16.5px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
            {BEND.body}
          </p>
          <ul className="mt-1.5 flex flex-col gap-2.75">
            {BEND.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.75 text-[15.5px]" style={{ color: 'var(--lp-tx-2)' }}>
                <CheckCircle2 size={20} className="flex-none" style={{ color: 'var(--lp-ac-2)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
