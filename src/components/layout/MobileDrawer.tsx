'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Wordmark } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { BOARD_NAV, FOOTER_NAV, PLAN_NAV, type NavItem } from '@/components/layout/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { usePlan } from '@/lib/providers/PlanProvider';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { state } = usePlan();

  const renderLink = (item: NavItem) => {
    const active = pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold',
          active ? 'bg-surface-4 text-text' : 'text-muted',
        )}
      >
        <Icon size={20} />
        {item.label}
      </Link>
    );
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{ background: 'var(--scrim)' }}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="relative flex h-full w-72 flex-col gap-4 overflow-y-auto border-r border-line p-4"
            style={{ background: 'var(--surface-1)' }}
          >
            <Wordmark />

            <div className="flex flex-col gap-0.5">{PLAN_NAV.map(renderLink)}</div>
            <div className="flex flex-col gap-0.5 border-t border-line pt-3">{BOARD_NAV.map(renderLink)}</div>
            <div className="flex flex-col gap-0.5 border-t border-line pt-3">{FOOTER_NAV.map(renderLink)}</div>

            <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-surface-4"
              >
                <Avatar name={user?.name ?? 'You'} src={user?.avatarUrl} size={34} />
                <span className="flex flex-col">
                  <span className="text-sm font-bold">{user?.name ?? 'Your profile'}</span>
                  <span className="text-[11px] font-semibold text-muted-2">
                    {state === 'PRO' ? 'Pro plan' : state === 'EXPIRED' ? 'Plan expired' : 'Free plan'}
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-ink"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
