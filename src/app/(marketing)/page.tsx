import type { Metadata } from 'next';
import { BendSection } from '@/components/marketing/BendSection';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { ContactSection } from '@/components/marketing/ContactSection';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { Hero } from '@/components/marketing/Hero';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { PricingSection } from '@/components/marketing/PricingSection';
import { QuoteCarousel } from '@/components/marketing/QuoteCarousel';
import { ScreensCarousel } from '@/components/marketing/ScreensCarousel';
import { StatBand } from '@/components/marketing/StatBand';

export const metadata: Metadata = {
  title: 'Life Planner — Your whole life, on one calm page.',
  description:
    'Goals, habits, tasks, calendar and the people you answer to — together, in one quiet place.',
};

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <StatBand />
      <FeaturesSection />
      <HowItWorks />
      <ScreensCarousel />
      <BendSection />
      <QuoteCarousel />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <ClosingCta />
    </main>
  );
}
