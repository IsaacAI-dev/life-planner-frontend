'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { publicApi } from '@/lib/api/public';
import { LegalPage } from '@/components/marketing/LegalPage';
import { TERMS } from '@/lib/marketing/legal';

export default function TermsPage() {
  const { data: apiPage } = useQuery({
    queryKey: ['public-terms'],
    queryFn: publicApi.terms,
  });

  if (apiPage) {
    return (
      <LegalPage
        title={apiPage.title}
        updated={`Version ${apiPage.version} · Published ${new Date(apiPage.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        intro={apiPage.intro}
        sections={apiPage.sections}
      />
    );
  }

  /* Fallback: verbatim handoff copy, matches the same LegalPage shape. */
  return (
    <LegalPage
      title={TERMS.title}
      updated={TERMS.updated}
      intro={
        <>
          {TERMS.intro.split('hello@lifeplanner.co')[0]}
          <Link href="mailto:hello@lifeplanner.co" style={{ color: 'var(--lp-ac)' }}>
            hello@lifeplanner.co
          </Link>
          {TERMS.intro.split('hello@lifeplanner.co')[1]}
        </>
      }
      sections={TERMS.sections}
    />
  );
}
