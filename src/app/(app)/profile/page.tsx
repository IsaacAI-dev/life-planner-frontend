'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  CreditCard,
  LogOut,
  MessagesSquare,
  Palette,
  Pencil,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { calendarSyncApi, goalsApi, statsApi } from '@/lib/api/planner';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardLabel } from '@/components/ui/Card';
import { formatDuration } from '@/lib/format';
import { useAuth } from '@/lib/providers/AuthProvider';
import { usePlan } from '@/lib/providers/PlanProvider';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { subDays } from 'date-fns';
import { toIsoDate } from '@/lib/format';

function Row({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border border-line-2 bg-surface-3 px-3.5 py-3">
      <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-surface-4 text-violet-ink">
        {icon}
      </span>
      <span className="text-sm font-bold">{label}</span>
      <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-muted">
        {value}
        {href ? <ChevronRight size={16} className="text-muted-4" /> : null}
      </span>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { state } = usePlan();
  const { theme, textScale } = useTheme();
  const [editOpen, setEditOpen] = useState(false);

  const range = { from: toIsoDate(subDays(new Date(), 6)), to: toIsoDate(new Date()) };

  const { data: streaks } = useQuery({ queryKey: ['streaks'], queryFn: statsApi.streaks });
  const { data: goals } = useQuery({ queryKey: ['goals'], queryFn: goalsApi.list });
  const { data: overview } = useQuery({
    queryKey: ['stats', 'overview', range.from, range.to],
    queryFn: () => statsApi.overview(range),
  });
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: authApi.getProfile });
  const { data: calendars } = useQuery({
    queryKey: ['calendar-connections'],
    queryFn: calendarSyncApi.listConnections,
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={user?.name ?? 'You'} src={user?.avatarUrl} size={72} />

        <div className="flex flex-col gap-1">
          <h2 className="font-display text-3xl font-bold tracking-tight">{user?.name}</h2>
          <span className="text-sm text-muted">{user?.email}</span>
          <span className="w-fit rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold text-on-accent">
            {state === 'EXPIRED' ? 'EXPIRED' : state}
          </span>
        </div>

        <Button variant="solid" className="ml-auto" icon={<Pencil size={16} />} onClick={() => setEditOpen(true)}>
          Edit profile
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex flex-col items-center gap-1 py-6">
          <span className="font-display text-3xl font-bold">{streaks?.current ?? 0}</span>
          <span className="text-xs text-muted">Day streak</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-6">
          <span className="font-display text-3xl font-bold">{goals?.length ?? 0}</span>
          <span className="text-xs text-muted">Goals</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-6">
          <span className="font-display text-3xl font-bold">
            {formatDuration(overview?.plannedMinutes ?? 0)}
          </span>
          <span className="text-xs text-muted">This week</span>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          <CardLabel>Preferences</CardLabel>
          <Row
            icon={<Palette size={17} />}
            label="Display & text size"
            value={`${theme === 'system' ? 'Device' : theme === 'dark' ? 'Dark' : 'Light'} · ${textScale.toLowerCase()}`}
            href="/settings"
          />
          <Row icon={<Bell size={17} />} label="Notifications" value="On" href="/settings" />
          <Row icon={<MessagesSquare size={17} />} label="Coach check-ins" value="Daily" href="/settings" />
        </div>

        <div className="flex flex-col gap-2.5">
          <CardLabel>Account</CardLabel>
          <Row icon={<UserRound size={17} />} label="Personal info" value={profile?.phone ?? 'Add details'} />
          <Row
            icon={<CreditCard size={17} />}
            label="Plan & billing"
            value={state === 'EXPIRED' ? 'Expired' : state}
            href="/plan"
          />
          <Row
            icon={<CalendarCheck size={17} />}
            label="Connected calendars"
            value={String(calendars?.length ?? 0)}
            href="/settings"
          />

          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl border border-line-2 px-3.5 py-3 text-sm font-bold text-red-ink"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </div>

      <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
