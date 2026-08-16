'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { chatApi } from '@/lib/api/chat';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { formatDate } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { FeedbackForm } from '@/lib/types';

function Stars({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          aria-label={`${score} out of 5`}
        >
          <Star
            size={20}
            className={score <= value ? 'text-amber-ink' : 'text-muted-4'}
            fill={score <= value ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Ratings are flat integers on the form — the coaches being rated are snapshotted
 * server-side, so a later reassignment does not rewrite history.
 */
export function FeedbackFormCard({ form }: { form: FeedbackForm }) {
  const queryClient = useQueryClient();
  const notify = useToast();

  const [platformRating, setPlatformRating] = useState(0);
  const [lifeCoachRating, setLifeCoachRating] = useState(0);
  const [fitnessRating, setFitnessRating] = useState(0);
  const [comment, setComment] = useState('');

  const submit = useMutation({
    mutationFn: () =>
      chatApi.respondToFeedbackForm(form.id, {
        platformRating,
        lifeCoachRating: lifeCoachRating || undefined,
        fitnessRating: fitnessRating || undefined,
        comment: comment || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-forms'] });
      notify('Thanks for the feedback');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (form.status !== 'SENT' || form.respondedAt) {
    return (
      <div className="max-w-[85%] rounded-2xl border border-line-2 bg-surface-3 px-3.5 py-3 text-xs text-muted">
        {form.status === 'EXPIRED'
          ? 'This feedback form has expired.'
          : 'Thanks — your feedback for this week is in.'}
      </div>
    );
  }

  return (
    <div
      className="flex max-w-[85%] flex-col gap-3 rounded-2xl border p-3.5"
      style={{ borderColor: 'var(--amber-ink)', background: 'var(--surface-3)' }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[10.5px] font-bold tracking-[0.1em] text-amber-ink uppercase">
          How was your week?
        </span>
        <span className="text-xs text-muted">
          {formatDate(form.periodStart, 'd MMM')} – {formatDate(form.periodEnd, 'd MMM')}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Life Planner overall</span>
        <Stars value={platformRating} onChange={setPlatformRating} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Your life coach</span>
        <Stars value={lifeCoachRating} onChange={setLifeCoachRating} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Fitness Assistant</span>
        <Stars value={fitnessRating} onChange={setFitnessRating} />
      </div>

      <Textarea
        rows={2}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Anything you want to add?"
      />

      <Button
        variant="accent"
        size="sm"
        disabled={platformRating === 0}
        loading={submit.isPending}
        onClick={() => submit.mutate()}
      >
        Send feedback
      </Button>
    </div>
  );
}
