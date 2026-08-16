'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bell, Menu, Plus, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/account';
import { PAGE_TITLES } from '@/components/layout/navigation';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { SearchPanel } from '@/components/layout/SearchPanel';

interface HeaderProps {
  onNewActivity: () => void;
  onOpenMenu: () => void;
}

export function Header({ onNewActivity, onOpenMenu }: HeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const title = PAGE_TITLES[pathname] ?? 'Life Planner';
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 120_000,
  });

  return (
    <>
      <header
        className="sticky top-0 z-20 flex h-16 flex-none items-center gap-3 border-b border-line px-4 backdrop-blur-xl sm:px-6"
        style={{ background: 'var(--header-bg)' }}
      >
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-text-3 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <h1 className="font-display text-lg font-semibold">{title}</h1>

        <div className="ml-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-xl border border-line-3 bg-surface-input px-3 py-2.5 text-[13px] text-muted-3 md:flex md:w-59"
          >
            <Search size={18} />
            Search activities, notes…
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex size-9.5 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-text-3 md:hidden"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notifications"
            className="relative flex size-9.5 items-center justify-center rounded-xl border border-line-2 bg-surface-2 text-text-3"
          >
            <Bell size={18} />
            {unread?.count ? (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-pink-ink px-1 text-[10px] font-extrabold text-on-accent">
                {unread.count}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={onNewActivity}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-[13px] font-bold text-on-accent shadow-[0_8px_24px_rgba(167,139,250,0.35)] sm:px-4"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New activity</span>
          </button>
        </div>
      </header>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
