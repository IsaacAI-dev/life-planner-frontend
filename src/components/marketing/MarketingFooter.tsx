'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Globe, Radio, Camera } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { LogoMark } from '@/components/brand/Logo';
import { NAV_LINKS, FOOTER } from '@/lib/marketing/content';

function FooterHeading({ children }: { children: string }) {
  return (
    <div className="text-xs font-bold tracking-[0.12em]" style={{ color: 'var(--lp-tx-4)' }}>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="text-left text-[14.5px]" style={{ color: 'var(--lp-tx-2)' }}>
      {children}
    </Link>
  );
}

export function MarketingFooter() {
  const { data: contactInfo } = useQuery({ queryKey: ['public-contact'], queryFn: publicApi.contactInfo });
  const { data: appLinks } = useQuery({ queryKey: ['app-links'], queryFn: publicApi.appLinks });

  const officeAddress = contactInfo?.officeAddress;

  return (
    <footer className="mt-16 border-t sm:mt-24" style={{ borderColor: 'var(--lp-line)', background: 'var(--lp-surf)' }}>
      <div className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8.5 px-6 py-12">
        <div className="flex max-w-75 flex-col gap-3.5">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} className="rounded-lg" />
            <span className="font-display text-base font-semibold" style={{ color: 'var(--lp-tx)' }}>
              Life Planner
            </span>
          </div>
          <p className="text-[14.5px] leading-relaxed" style={{ color: 'var(--lp-tx-3)' }}>
            {FOOTER.tagline}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {[Globe, Camera, Radio].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="flex size-8.5 items-center justify-center rounded-lg border"
                style={{ borderColor: 'var(--lp-line-2)', color: 'var(--lp-tx-3)' }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          {appLinks?.appStore || appLinks?.playStore ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              {appLinks.appStore ? (
                <a href={appLinks.appStore.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- official store badge, backend-supplied */}
                  <img src={appLinks.appStore.badgeImageUrl} alt="Download on the App Store" className="h-10" />
                </a>
              ) : null}
              {appLinks.playStore ? (
                <a href={appLinks.playStore.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- official store badge, backend-supplied */}
                  <img src={appLinks.playStore.badgeImageUrl} alt="Get it on Google Play" className="h-10" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5">
          <FooterHeading>PRODUCT</FooterHeading>
          {NAV_LINKS.map((link) => (
            <FooterLink key={link.id} href={`/#${link.id}`}>
              {link.label}
            </FooterLink>
          ))}
          <FooterLink href="/today">Open the app</FooterLink>
        </div>

        <div className="flex flex-col gap-2.5">
          <FooterHeading>COMPANY</FooterHeading>
          <FooterLink href="/about">About us</FooterLink>
          <FooterLink href="/#lp-contact">Contact us</FooterLink>
          <FooterLink href="/#lp-faq">FAQ</FooterLink>
          <FooterLink href="/careers">Careers</FooterLink>
        </div>

        <div className="flex flex-col gap-2.5">
          <FooterHeading>LEGAL</FooterHeading>
          <FooterLink href="/terms">Terms &amp; Conditions</FooterLink>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
        </div>

        <div className="flex flex-col gap-2.5">
          <FooterHeading>CONTACT</FooterHeading>
          {(contactInfo ? [contactInfo.email] : FOOTER.emails).map((email) => (
            <a key={email} href={`mailto:${email}`} className="text-[14.5px]" style={{ color: 'var(--lp-tx-2)' }}>
              {email}
            </a>
          ))}
          {/* Shown only when the backend actually has an office address to publish. */}
          {officeAddress ? (
            <span className="text-[14.5px] leading-snug" style={{ color: 'var(--lp-tx-3)' }}>
              {officeAddress}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 border-t px-6 py-5"
        style={{ borderColor: 'var(--lp-line)' }}
      >
        <span className="text-[13.5px]" style={{ color: 'var(--lp-tx-4)' }}>
          {FOOTER.legalLine}
        </span>
        <span className="ml-auto text-[13.5px]" style={{ color: 'var(--lp-tx-4)' }}>
          {FOOTER.madeIn}
        </span>
      </div>
    </footer>
  );
}
