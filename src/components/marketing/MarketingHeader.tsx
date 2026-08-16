'use client';

import Link from 'next/link';
import { LogoMark } from '@/components/brand/Logo';
import { NAV_LINKS } from '@/lib/marketing/content';

export function MarketingHeader() {
  return (
    <header
      className="sticky top-0 z-70 border-b backdrop-blur-2xl"
      style={{ borderColor: 'var(--lp-line)', background: 'rgba(20,16,25,.66)' }}
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-6 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={32} className="rounded-lg" />
          <span className="font-display text-base font-semibold tracking-tight" style={{ color: 'var(--lp-tx)' }}>
            Life Planner
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={`/#${link.id}`}
              scroll={true}
              className="scroll-mt-24 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors"
              style={{ color: 'var(--lp-tx-2)' }}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/about" className="rounded-lg px-2.5 py-1.5 text-sm font-semibold" style={{ color: 'var(--lp-tx-2)' }}>
            About
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Link href="/sign-in" className="px-3 py-2 text-sm font-semibold" style={{ color: 'var(--lp-tx-2)' }}>
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 rounded-full px-4.5 py-2.5 font-display text-sm font-semibold whitespace-nowrap"
            style={{ background: 'var(--lp-grad)', color: '#141019', boxShadow: 'var(--lp-glow)' }}
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
