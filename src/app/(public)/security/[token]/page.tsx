'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { publicApi } from '@/lib/api/public';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import type { SecurityTokenType } from '@/lib/types';

const HEADLINES: Record<SecurityTokenType, string> = {
  SIGNUP: 'Did you create this account?',
  PASSWORD_RESET: 'Did you ask to reset your password?',
  SEAT_INVITE: 'Were you expecting this invitation?',
};

const CONSEQUENCES: Record<SecurityTokenType, string> = {
  SIGNUP: 'Reporting this suspends the account and signs it out everywhere.',
  PASSWORD_RESET: 'Reporting this voids the reset links and signs out every session.',
  SEAT_INVITE: 'Reporting this cancels the invitation and flags the sender to our team.',
};

export default function SecurityTokenPage() {
  const params = useParams<{ token: string }>();
  const [note, setNote] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['security-token', params.token],
    queryFn: () => publicApi.securityToken(params.token),
    retry: false,
  });

  const act = useMutation({
    mutationFn: (action: 'REJECT' | 'REPORT') =>
      publicApi.actOnSecurityToken(params.token, { action, note: note || undefined }),
  });

  if (isLoading) return <PageSkeleton />;

  if (isError || !data) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertTriangle size={28} className="text-amber-ink" />
        <h1 className="font-display text-xl font-semibold">This link is no longer valid</h1>
        <p className="text-sm text-muted">
          Security links can be used once and expire after 30 days. If something still looks wrong,
          contact support from inside the app.
        </p>
      </Card>
    );
  }

  if (act.isSuccess) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 size={28} className="text-green-ink" />
        <h1 className="font-display text-xl font-semibold">
          {act.data.outcome === 'REPORTED' ? 'Thanks — we are on it' : 'Invitation declined'}
        </h1>
        <p className="max-w-sm text-sm text-muted">{act.data.message}</p>
        <ul className="flex flex-col gap-1.5 text-sm text-muted-3">
          {act.data.consequences.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <ShieldAlert size={22} className="mt-0.5 flex-none text-amber-ink" />
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl leading-tight font-semibold">{HEADLINES[data.type]}</h1>
          {/* Server-authored and already names whoever triggered this. */}
          <p className="text-sm text-muted">{data.summary}</p>
          <p className="text-xs text-muted-3">Sent to {data.email}.</p>
        </div>
      </div>

      <p className="text-sm text-muted">
        If this was you, you can close this page — nothing happens. If it was not, tell us and we
        will undo it.
      </p>

      {data.canReject ? (
        <Button
          variant="solid"
          size="lg"
          loading={act.isPending}
          onClick={() => act.mutate('REJECT')}
        >
          No thanks — just decline
        </Button>
      ) : null}

      <div className="flex flex-col gap-2 rounded-xl border border-line-2 bg-surface-3 p-3.5">
        <span className="text-sm font-bold">I did not do this</span>
        <span className="text-xs text-muted">{CONSEQUENCES[data.type]}</span>

        <Textarea
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything you want to add? (optional)"
        />

        <Button
          variant="danger"
          loading={act.isPending}
          onClick={() => act.mutate('REPORT')}
        >
          Report this
        </Button>
      </div>

      <p className="text-xs text-muted-3">
        This link expires {formatDate(data.expiresAt, 'd MMM yyyy')} and can only be used once.
      </p>
    </Card>
  );
}
