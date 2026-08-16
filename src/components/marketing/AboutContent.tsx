'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bolt, ExternalLink, Heart, Shield } from 'lucide-react';
import Link from 'next/link';
import { publicApi } from '@/lib/api/public';
import { ImageSlot } from '@/components/marketing/ImageSlot';
import { Kicker } from '@/components/marketing/Kicker';
import { ABOUT } from '@/lib/marketing/content';

const BELIEF_ICONS = { favorite: Heart, shield: Shield, bolt: Bolt } as const;

export function AboutContent() {
  const { data: assets } = useQuery({ queryKey: ['marketing-assets'], queryFn: publicApi.marketingAssets });
  const { data: aboutData } = useQuery({ queryKey: ['public-about'], queryFn: publicApi.about });

  // API headline/body supersede static copy when present.
  const headline = aboutData?.headline ?? ABOUT.h1;
  const body = aboutData?.body ?? ABOUT.intro;

  // API staff uses staffRole/photoUrl; static team uses role. Normalise into one shape.
  const staff = aboutData?.staff
    ? aboutData.staff.map((m) => ({
        name: m.name, role: m.staffRole, imageUrl: m.photoUrl,
        favQuote: m.favQuote, linkedIn: m.linkedIn,
      }))
    : ABOUT.team.map((m) => ({ name: m.name, role: m.role, imageUrl: null, favQuote: null, linkedIn: null }));

  return (
    <main className="mx-auto max-w-215 px-6 pt-11 sm:pt-21">
      <Link
        href="/"
        className="mb-6.5 flex w-fit items-center gap-1.75 text-sm font-semibold"
        style={{ color: 'var(--lp-tx-3)' }}
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>

      <Kicker>{ABOUT.kicker}</Kicker>
      <h1
        className="mt-3.5 font-display text-[clamp(34px,5vw,56px)] leading-[1.08] font-semibold"
        style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
      >
        {headline}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
        {body}
      </p>

      <div
        className="my-8 overflow-hidden rounded-[18px] border sm:my-12"
        style={{ borderColor: 'var(--lp-line-2)', aspectRatio: '16 / 8', background: 'var(--lp-surf-in)' }}
      >
        <ImageSlot placeholder="Team or workspace photo — wide, dark background" src={assets?.aboutHeroUrl} />
      </div>

      <h2 className="mb-3 font-display text-[clamp(23px,2.8vw,31px)] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}>
        {ABOUT.beliefsHeading}
      </h2>
      <p className="mb-4 text-[16.5px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
        {ABOUT.beliefsIntro}
      </p>
      <p className="mb-4 text-[16.5px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
        {ABOUT.beliefsSecondary}
      </p>

      <div className="my-7 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:my-11">
        {ABOUT.beliefs.map((belief) => {
          const Icon = BELIEF_ICONS[belief.icon as keyof typeof BELIEF_ICONS];
          return (
            <div
              key={belief.title}
              className="flex flex-col gap-2.25 rounded-[18px] border p-5.5"
              style={{ background: 'var(--lp-surf)', borderColor: 'var(--lp-line-2)' }}
            >
              <Icon size={24} style={{ color: 'var(--lp-ac)' }} />
              <h3 className="font-display text-[17.5px] font-semibold" style={{ color: 'var(--lp-tx)' }}>
                {belief.title}
              </h3>
              <p className="text-[14.5px] leading-relaxed" style={{ color: 'var(--lp-tx-2)' }}>
                {belief.body}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 font-display text-[clamp(23px,2.8vw,31px)] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}>
        {ABOUT.peopleHeading}
      </h2>
      <p className="mb-5.5 text-[16.5px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
        {ABOUT.peopleIntro}
      </p>

      <div className="mb-13 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
        {staff.map((person) => (
          <div key={person.name} className="flex flex-col gap-2.5">
            <div
              className="overflow-hidden rounded-[18px] border"
              style={{ aspectRatio: '1 / 1', borderColor: 'var(--lp-line-2)', background: 'var(--lp-surf-in)' }}
            >
              <ImageSlot
                placeholder={`Portrait — ${person.role.toLowerCase()}`}
                src={
                  person.imageUrl ??
                  assets?.teamPortraits.find((portrait) => portrait.name === person.name)?.imageUrl
                }
              />
            </div>
            <div>
              <div className="font-display text-[15.5px] font-semibold" style={{ color: 'var(--lp-tx)' }}>
                {person.name}
              </div>
              <div className="text-[13.5px]" style={{ color: 'var(--lp-tx-3)' }}>
                {person.role}
              </div>
              {person.favQuote ? (
                <p className="mt-1 text-[12.5px] italic leading-snug" style={{ color: 'var(--lp-tx-4)' }}>
                  &ldquo;{person.favQuote}&rdquo;
                </p>
              ) : null}
              {person.linkedIn ? (
                <a
                  href={person.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${person.name} on LinkedIn`}
                  className="mt-1.5 flex w-fit items-center gap-1.5 text-[12.5px] font-semibold"
                  style={{ color: 'var(--lp-ac)' }}
                >
                  <ExternalLink size={14} />
                  LinkedIn
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
