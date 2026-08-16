'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Wordmark } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { BOARD_NAV, FOOTER_NAV, PLAN_NAV, type NavItem } from '@/components/layout/navigation';
import { statsApi } from '@/lib/api/planner';
import { useAuth } from '@/lib/providers/AuthProvider';
import { usePlan } from '@/lib/providers/PlanProvider';
import { cn } from '@/lib/utils';

function NavLink({ item, badge }: { item: NavItem; badge?: number }) {
  const pathname = usePathname();
  const active = pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
        active ? 'bg-surface-4 text-text' : 'text-muted hover:text-text-2',
      )}
    >
      <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
      {item.label}
      {badge ? (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-ink px-1.5 text-[11px] font-extrabold text-on-accent">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="px-2 pb-2 text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
      {children}
    </div>
  );
}

export function Sidebar({ flexibleCount, unreadCount }: { flexibleCount: number; unreadCount: number }) {
  const { user } = useAuth();
  const { state } = usePlan();
  const { data: streaks } = useQuery({ queryKey: ['streaks'], queryFn: statsApi.streaks });

  return (
    <nav
      className="sticky top-0 hidden h-screen w-61 flex-none flex-col gap-4 overflow-y-auto border-r border-line px-3.5 py-5 lg:flex"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <Link href="/today" className="px-2">
        <Wordmark />
      </Link>

      <div className="flex flex-col gap-0.5">
        <SectionLabel>Plan</SectionLabel>
        {PLAN_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            badge={item.href === '/flexible' ? flexibleCount : undefined}
          />
        ))}
      </div>

      <div className="flex flex-col gap-0.5">
        <SectionLabel>Boards</SectionLabel>
        {BOARD_NAV.map((item) => (
          <NavLink key={item.href} item={item} badge={item.href === '/chats' ? unreadCount : undefined} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        {FOOTER_NAV.map((item) => (
          <div key={item.href} className="relative">
            <NavLink item={item} />
            {item.href === '/plan' ? (
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-on-accent">
                {state === 'EXPIRED' ? 'EXPIRED' : state}
              </span>
            ) : null}
          </div>
        ))}

        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-line-dash p-3">
          <div className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Day streak</div>
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-ink" />
            <span className="font-display text-xl font-semibold">{streaks?.current ?? 0} days</span>
          </div>
        </div>

        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-surface-4"
        >
          <Avatar name={user?.name ?? 'You'} src={user?.avatarUrl} size={32} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-bold text-text-2">{user?.name ?? 'Your profile'}</span>
            <span className="text-[11px] font-semibold text-muted-2">
              {state === 'PRO' ? 'Pro plan' : state === 'EXPIRED' ? 'Plan expired' : 'Free plan'}
            </span>
          </span>
          <ChevronRight size={18} className="ml-auto text-muted-4" />
        </Link>
      </div>
    </nav>
  );
}
