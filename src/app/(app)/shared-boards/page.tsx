'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, ChevronRight, Lock, Share2, Unlock, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { boardsApi } from '@/lib/api/boards';
import { ShareBoardDialog } from '@/components/boards/ShareBoardDialog';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardLabel } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { BoardPermission } from '@/lib/types';

export default function SharedBoardsPage() {
  const queryClient = useQueryClient();
  const notify = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: granted, isLoading } = useQuery({
    queryKey: ['board-shares', 'granted'],
    queryFn: () => boardsApi.list('granted'),
  });

  const { data: received } = useQuery({
    queryKey: ['board-shares', 'received'],
    queryFn: () => boardsApi.list('received'),
  });

  const { data: revoked } = useQuery({
    queryKey: ['board-shares', 'granted', 'revoked'],
    queryFn: () => boardsApi.list('granted', 'REVOKED'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['board-shares'] });

  const updatePermission = useMutation({
    mutationFn: ({ id, permission }: { id: string; permission: BoardPermission }) =>
      boardsApi.updatePermission(id, permission),
    onSuccess: () => {
      invalidate();
      notify('Access level updated');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => boardsApi.revoke(id),
    onSuccess: () => {
      invalidate();
      notify('Access revoked');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="mx-auto flex max-w-320 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight">Shared boards</h2>
        <Button
          variant="solid"
          className="ml-auto"
          icon={<Share2 size={17} />}
          onClick={() => setDialogOpen(true)}
        >
          Share my board
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          <CardLabel>People who see my board</CardLabel>

          {granted?.length ? (
            granted.map((share) => (
              <Card key={share.id} className="flex flex-wrap items-center gap-3">
                <Avatar name={share.viewer.name} src={share.viewer.avatarUrl} size={40} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold">{share.viewer.name}</span>
                  <span className="truncate text-xs text-muted">{share.viewer.email}</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={share.permission === 'FULL' ? <Unlock size={14} /> : <Lock size={14} />}
                    onClick={() =>
                      updatePermission.mutate({
                        id: share.id,
                        permission: share.permission === 'FULL' ? 'PUBLIC_ONLY' : 'FULL',
                      })
                    }
                  >
                    {share.permission === 'FULL' ? 'Everything' : 'Public only'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => revoke.mutate(share.id)}
                    aria-label={`Revoke access for ${share.viewer.name}`}
                    className="flex size-8 items-center justify-center rounded-lg border border-line-2 text-muted-3"
                  >
                    <UserMinus size={15} />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={<Share2 size={22} />}
              title="Nobody sees your board"
              description="Share it with a partner or friend. You choose whether private activities are included."
            />
          )}

          {revoked?.length ? (
            <Card className="flex flex-col gap-2" dashed>
              <CardLabel>Revoked</CardLabel>
              {revoked.map((share) => (
                <div key={share.id} className="flex items-center gap-2.5">
                  <Avatar name={share.viewer.name} size={30} />
                  <span className="text-sm font-semibold text-muted">{share.viewer.name}</span>
                  <span className="ml-auto text-xs text-muted-3">
                    Access revoked {formatDate(share.createdAt)}
                  </span>
                </div>
              ))}
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5">
          <CardLabel>Boards I can see</CardLabel>

          {received?.length ? (
            received.map((share) => (
              <Link key={share.id} href={`/shared-boards/${share.owner.id}`}>
                <Card className="flex items-center gap-3">
                  <Avatar name={share.owner.name} src={share.owner.avatarUrl} size={40} />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold">{share.owner.name}&apos;s board</span>
                    <span className="truncate text-xs text-muted">
                      {share.permission === 'FULL' ? 'Everything' : 'Public activities only'} · read-only
                    </span>
                  </div>
                  <ChevronRight size={18} className="ml-auto flex-none text-muted-4" />
                </Card>
              </Link>
            ))
          ) : (
            <EmptyState
              icon={<ArrowLeftRight size={22} />}
              title="No boards shared with you"
              description="Sharing goes one way. Ask someone to share their board if you want to see it."
            />
          )}

          <Card className="flex items-start gap-3" dashed>
            <ArrowLeftRight size={18} className="mt-0.5 flex-none text-cyan-ink" />
            <p className="text-sm text-muted">
              Sharing goes one way. Granting someone access to your board does not give you access to
              theirs — they have to share back.
            </p>
          </Card>
        </div>
      </div>

      <ShareBoardDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
