'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { seatsApi } from '@/lib/api/subscription';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useToast } from '@/lib/providers/ToastProvider';

export default function SeatInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const notify = useToast();
  const { user, loading } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seat-invite', params.token],
    queryFn: () => seatsApi.invitePreview(params.token),
    retry: false,
  });

  const claim = useMutation({
    mutationFn: () => seatsApi.claim(params.token),
    onSuccess: () => {
      notify('Pro is now active on your account');
      router.push('/today');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (isLoading || loading) return <PageSkeleton />;

  if (isError || !data) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertTriangle size={28} className="text-amber-ink" />
        <h1 className="font-display text-xl font-semibold">That invitation is not valid</h1>
        <p className="text-sm text-muted">
          It may have been claimed, cancelled or expired. Ask whoever invited you to send a new one.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Sparkles size={22} className="mt-0.5 flex-none text-violet-ink" />
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl leading-tight font-semibold">
            {data.invitedBy} bought you Life Planner Pro
          </h1>
          <p className="text-sm text-muted">
            Sent to {data.email} · expires {formatDate(data.expiresAt, 'd MMM yyyy')}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-line-dash p-3.5">
        <Shield size={17} className="mt-0.5 flex-none text-cyan-ink" />
        {/* Server-authored; this reassurance is the reason the page exists. */}
        <p className="text-xs text-muted">{data.privacyNote}</p>
      </div>

      {user ? (
        <Button variant="accent" size="lg" loading={claim.isPending} onClick={() => claim.mutate()}>
          <CheckCircle2 size={17} />
          Accept and turn on Pro
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">Sign in or create your account to accept.</p>
          <Link href={`/sign-up?invite=${params.token}`}>
            <Button variant="accent" size="lg" className="w-full">
              Create my account
            </Button>
          </Link>
          <Link href={`/sign-in?invite=${params.token}`}>
            <Button variant="outline" size="lg" className="w-full">
              I already have one
            </Button>
          </Link>
        </div>
      )}

      <Link
        href={`/security/${params.token}`}
        className="text-center text-xs font-semibold text-muted-3 underline"
      >
        I was not expecting this
      </Link>
    </Card>
  );
}
