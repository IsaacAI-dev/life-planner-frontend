import Link from 'next/link';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/Logo';
import { AuthHero } from '@/components/layout/AuthHero';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--app-bg)' }}>
      <AuthHero />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10">
        {/* AuthHero carries the logo from lg up; below that it has nowhere to live. */}
        <Link href="/" className="mb-8 w-fit lg:hidden">
          <Wordmark size={30} />
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
