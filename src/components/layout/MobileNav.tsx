'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_NAV } from '@/components/layout/navigation';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {MOBILE_NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-bold',
              active ? 'text-violet-ink' : 'text-muted-3',
            )}
          >
            <Icon size={21} strokeWidth={active ? 2.3 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
