import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface LegalSection {
  h: string;
  p: string | string[] | { strong: string; rest: string }[];
}

function isStrongList(p: LegalSection['p']): p is { strong: string; rest: string }[] {
  return Array.isArray(p) && typeof p[0] === 'object';
}

function Paragraphs({ p }: { p: LegalSection['p'] }) {
  if (isStrongList(p)) {
    return (
      <>
        {p.map((item, index) => (
          <p key={index} className="mb-3.5 text-base leading-relaxed text-pretty last:mb-5.5" style={{ color: 'var(--lp-tx-2)' }}>
            <strong style={{ color: 'var(--lp-tx)' }}>{item.strong}</strong> {item.rest}
          </p>
        ))}
      </>
    );
  }

  const paragraphs = Array.isArray(p) ? p : [p];
  return (
    <>
      {paragraphs.map((text, index) => (
        <p key={index} className="mb-3.5 text-base leading-relaxed text-pretty last:mb-5.5" style={{ color: 'var(--lp-tx-2)' }}>
          {text}
        </p>
      ))}
    </>
  );
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  /** Either a static React node (with embedded links) or a plain API string. */
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="mx-auto max-w-190 px-6 pt-11 sm:pt-21">
      <Link
        href="/"
        className="mb-6.5 flex w-fit items-center gap-1.75 text-sm font-semibold"
        style={{ color: 'var(--lp-tx-3)' }}
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>

      <h1
        className="font-display text-[clamp(32px,4.6vw,50px)] leading-[1.1] font-semibold"
        style={{ color: 'var(--lp-tx)', letterSpacing: '-0.03em' }}
      >
        {title}
      </h1>
      <p className="mt-3 text-[14.5px]" style={{ color: 'var(--lp-tx-4)' }}>
        {updated}
      </p>
      <p className="mt-5.5 text-[17px] leading-relaxed text-pretty" style={{ color: 'var(--lp-tx-2)' }}>
        {intro}
      </p>

      <div className="my-7 h-px sm:my-10" style={{ background: 'var(--lp-rule)' }} />

      {sections.map((section) => (
        <div key={section.h}>
          <h2 className="mb-2.5 font-display text-[21px] font-semibold" style={{ color: 'var(--lp-tx)', letterSpacing: '-0.01em' }}>
            {section.h}
          </h2>
          <Paragraphs p={section.p} />
        </div>
      ))}
    </main>
  );
}
