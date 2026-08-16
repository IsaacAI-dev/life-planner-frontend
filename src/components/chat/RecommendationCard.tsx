'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, Check, X } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { Button } from '@/components/ui/Button';
import { formatDate, formatTime } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { Recommendation } from '@/lib/types';

/**
 * A coach's suggested activity or goal. Accepting creates the real row — and
 * still spends the user's own quota, so a coach cannot spend it for them.
 */
export function RecommendationCard({
  recommendation,
  conversationId,
}: {
  recommendation: Recommendation;
  conversationId: string;
}) {
  const queryClient = useQueryClient();
  const notify = useToast();

  const respond = useMutation({
    mutationFn: (action: 'ACCEPT' | 'DISMISS') =>
      chatApi.respondToRecommendation(recommendation.id, action),
    onSuccess: (result, action) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      notify(
        action === 'ACCEPT'
          ? result.createdEntityId
            ? 'Added to your board'
            : 'Accepted'
          : 'Suggestion dismissed',
      );
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  // A second response returns 400, so the buttons close as soon as one is sent
  // rather than waiting for the refetch to change `status`.
  const settled = recommendation.status !== 'PENDING' || respond.isSuccess;
  const busy = respond.isPending || respond.isSuccess;

  return (
    <div
      className="flex max-w-[85%] flex-col gap-3 rounded-2xl border p-3.5"
      style={{ borderColor: 'var(--violet-ink-2)', background: 'var(--surface-3)' }}
    >
      <div className="flex items-start gap-2.5">
        <CalendarPlus size={18} className="mt-0.5 flex-none text-violet-ink" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-violet-ink uppercase">
            Suggested {recommendation.kind === 'GOAL' ? 'goal' : 'activity'}
          </span>
          {/* Title, date and times are nested under payload. */}
          <span className="text-sm font-bold">{recommendation.payload.title}</span>
          {recommendation.payload.date ? (
            <span className="text-xs text-muted">
              {formatDate(recommendation.payload.date, 'EEE d MMM')}
              {recommendation.payload.startTime
                ? ` · ${formatTime(recommendation.payload.startTime)}`
                : ''}
            </span>
          ) : null}
          {recommendation.payload.description ? (
            <p className="mt-1 text-xs text-muted">{recommendation.payload.description}</p>
          ) : null}
        </div>
      </div>

      {settled ? (
        <span
          className="text-xs font-bold"
          style={{
            color:
              recommendation.status === 'ACCEPTED' || respond.data?.status === 'ACCEPTED'
                ? 'var(--green-ink)'
                : 'var(--muted-3)',
          }}
        >
          {recommendation.status === 'ACCEPTED' || respond.data?.status === 'ACCEPTED'
            ? 'Added to your board'
            : 'Dismissed'}
        </span>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="accent"
            size="sm"
            className="flex-1"
            icon={<Check size={15} />}
            loading={respond.isPending}
            disabled={busy}
            onClick={() => respond.mutate('ACCEPT')}
          >
            Add it
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            icon={<X size={15} />}
            disabled={busy}
            onClick={() => respond.mutate('DISMISS')}
          >
            No thanks
          </Button>
        </div>
      )}
    </div>
  );
}
