import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/Logo';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center px-5 py-10"
      style={{ background: 'var(--app-bg)' }}
    >
      <div className="mb-8">
        <Wordmark size={34} />
      </div>
      <main className="w-full max-w-lg">{children}</main>
    </div>
  );
}
