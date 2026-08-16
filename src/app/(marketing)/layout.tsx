import type { ReactNode } from 'react';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

/**
 * The Aurora design has no light variant, so this scope is pinned dark via the
 * `.lp` class regardless of the signed-in app's theme — see globals.css.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lp min-h-screen overflow-x-hidden">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
