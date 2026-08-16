'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, Shield, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { seatsApi } from '@/lib/api/subscription';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardLabel } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { SeatStatus } from '@/lib/types';

const STATUS_COLORS: Record<SeatStatus, string> = {
  ACTIVE: 'var(--green-ink)',
  INVITED: 'var(--amber-ink)',
  DECLINED: 'var(--muted-3)',
  EXPIRED: 'var(--muted-3)',
  CANCELLED: 'var(--muted-3)',
};

const STATUS_LABELS: Record<SeatStatus, string> = {
  ACTIVE: 'Active',
  INVITED: 'Invited',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

export default function SeatsPage() {
  const queryClient = useQueryClient();
  const notify = useToast();
  const [email, setEmail] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['seats'], queryFn: seatsApi.list });

  const invite = useMutation({
    mutationFn: () => seatsApi.invite([email]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seats'] });
      notify('Invitation sent');
      setEmail('');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const remove = useMutation({
    mutationFn: (seatId: string) => seatsApi.remove(seatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seats'] });
      notify('Seat removed');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link href="/plan" className="flex items-center gap-2 text-sm font-bold text-violet-ink">
        <ArrowLeft size={16} />
        Back to plan
      </Link>

      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight">Seats</h2>
        <span className="text-sm text-muted">
          {data?.used ?? 0} of {data?.seatCount ?? 0} used
          {data?.pendingSeatCount ? ` \u00b7 ${data.pendingSeatCount} awaiting reply` : ''}
        </span>
      </div>

      <Card className="flex items-start gap-3" dashed>
        <Shield size={18} className="mt-0.5 flex-none text-cyan-ink" />
        <p className="text-sm text-muted">
          A seat grants Pro and nothing else. You cannot see their activities, goals, budget, meals
          or chats — not even a count. If you want to see each other&apos;s boards, that is a
          separate share either of you can offer.
        </p>
      </Card>

      {data?.available ? (
        <Card className="flex flex-col gap-3">
          <CardLabel>Invite someone</CardLabel>
          <div className="flex flex-wrap gap-2">
            <Input
              type="email"
              className="min-w-50 flex-1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="someone@example.com"
              icon={<Mail size={17} />}
            />
            <Button
              variant="accent"
              icon={<UserPlus size={16} />}
              loading={invite.isPending}
              disabled={!email.trim()}
              onClick={() => invite.mutate()}
            >
              Send invite
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col gap-2.5">
        <CardLabel>On this plan</CardLabel>

        {data?.seats.length ? (
          data.seats.map((seat) => (
            <Card key={seat.id} className="flex flex-wrap items-center gap-3">
              <Avatar name={seat.name ?? seat.email} size={38} />

              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold">{seat.name ?? seat.email}</span>
                <span className="truncate text-xs text-muted">
                  {seat.name ? seat.email : `Invited ${formatDate(seat.invitedAt)}`}
                </span>
              </div>

              <span
                className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ color: STATUS_COLORS[seat.status], background: 'var(--surface-4)' }}
              >
                {STATUS_LABELS[seat.status]}
              </span>

              <button
                type="button"
                onClick={() => remove.mutate(seat.id)}
                aria-label={`Remove ${seat.email}`}
                className="flex size-8 flex-none items-center justify-center rounded-lg border border-line-2 text-muted-3"
              >
                <Trash2 size={15} />
              </button>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<UserPlus size={22} />}
            title="No one else yet"
            description="Invite someone and they get their own Pro account — separate coach, separate board."
          />
        )}

        <p className="text-xs text-muted">
          An unclaimed invitation is pulled straight away. An active seat runs to the end of the
          period, because it has been paid for.
        </p>
      </div>

      {data?.history.length ? (
        <div className="flex flex-col gap-2.5">
          <CardLabel>Previously</CardLabel>
          {data.history.map((seat) => (
            <Card key={seat.id} className="flex items-center gap-3 py-3" dashed>
              <span className="text-sm font-semibold text-muted">{seat.email}</span>
              <span className="ml-auto text-xs text-muted-3">{STATUS_LABELS[seat.status]}</span>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
