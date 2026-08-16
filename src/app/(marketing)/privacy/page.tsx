'use client';

import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import { LegalPage } from '@/components/marketing/LegalPage';
import { PRIVACY } from '@/lib/marketing/legal';

export default function PrivacyPage() {
  const { data: apiPage } = useQuery({
    queryKey: ['public-privacy'],
    queryFn: publicApi.privacy,
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

  return <LegalPage title={PRIVACY.title} updated={PRIVACY.updated} intro={PRIVACY.intro} sections={PRIVACY.sections} />;
}
