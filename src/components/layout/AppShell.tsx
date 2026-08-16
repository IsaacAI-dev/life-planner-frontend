'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { activitiesApi } from '@/lib/api/activities';
import { chatApi } from '@/lib/api/chat';
import { Header } from '@/components/layout/Header';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { NewActivityDialog } from '@/components/activities/NewActivityDialog';
import { BootScreen } from '@/components/layout/BootScreen';
import { useAuth } from '@/lib/providers/AuthProvider';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [newActivityOpen, setNewActivityOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  const { data: flexible } = useQuery({
    queryKey: ['activities', 'flexible', 'count'],
    queryFn: () => activitiesApi.list({ flexible: true }),
    enabled: Boolean(user),
  });

  const { data: unread } = useQuery({
    queryKey: ['chat', 'unread'],
    queryFn: chatApi.unreadCount,
    enabled: Boolean(user),
  });

  if (loading || !user) return <BootScreen />;

  const openFlexible = flexible?.filter((task) => !task.isDone).length ?? 0;


  return (
    <div className="flex min-h-screen" style={{ background: 'var(--app-bg)' }}>
      <Sidebar flexibleCount={openFlexible} unreadCount={unread?.total ?? 0} />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex min-w-0 flex-1 flex-col">
        <Header onNewActivity={() => setNewActivityOpen(true)} onOpenMenu={() => setMenuOpen(true)} />
        <div className="flex-1 px-4 pt-5 pb-28 sm:px-6 lg:pb-11">{children}</div>
      </main>

      <MobileNav />
      <NewActivityDialog open={newActivityOpen} onClose={() => setNewActivityOpen(false)} />
    </div>
  );
}
