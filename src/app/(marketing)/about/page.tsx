import type { Metadata } from 'next';
import { AboutContent } from '@/components/marketing/AboutContent';

export const metadata: Metadata = { title: 'About us — Life Planner' };

export default function AboutPage() {
  return <AboutContent />;
}
