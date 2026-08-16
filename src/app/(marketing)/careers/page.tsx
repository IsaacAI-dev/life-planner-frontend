import type { Metadata } from 'next';
import { CareersContent } from '@/components/marketing/CareersContent';

export const metadata: Metadata = { title: 'Careers — Life Planner' };

export default function CareersPage() {
  return <CareersContent />;
}
