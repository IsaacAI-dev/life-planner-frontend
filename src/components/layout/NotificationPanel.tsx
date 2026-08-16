'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { BellOff } from 'lucide-react';
import { notificationsApi } from '@/lib/api/account';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(20),
    enabled: open,
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <Dialog open={open} onClose={onClose} title="Notifications">
      {!data?.length ? (
        <EmptyState
          icon={<BellOff size={22} />}
          title="Nothing new"
          description="Reminders, coach replies and plan updates will show up here."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((notification) => {
            const body = (
              <div
                className="flex flex-col gap-1 rounded-xl border border-line-2 bg-surface-4 px-3.5 py-3"
                style={notification.readAt ? undefined : { borderColor: 'var(--violet-ink-2)' }}
              >
                <span className="text-sm font-bold text-text-2">{notification.title}</span>
                {notification.body ? <span className="text-xs text-muted">{notification.body}</span> : null}
                <span className="text-[11px] font-semibold text-muted-3">
                  {formatDate(notification.createdAt, 'd MMM, HH:mm')}
                </span>
              </div>
            );

            return notification.href ? (
              <Link key={notification.id} href={notification.href} onClick={onClose}>
                {body}
              </Link>
            ) : (
              <div key={notification.id}>{body}</div>
            );
          })}

          <Button variant="outline" size="sm" className="mt-2 self-end" onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        </div>
      )}
    </Dialog>
  );
}
