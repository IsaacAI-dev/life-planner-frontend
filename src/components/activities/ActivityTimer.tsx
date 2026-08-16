'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { activitiesApi } from '@/lib/api/activities';
import { Button } from '@/components/ui/Button';
import { formatClock } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';

/** Start/stop a real session so planned minutes can be compared with actual. */
export function ActivityTimer({ activityId }: { activityId: string }) {
  const queryClient = useQueryClient();
  const notify = useToast();
  const [now, setNow] = useState(() => Date.now());

  const { data } = useQuery({
    queryKey: ['sessions', activityId],
    queryFn: () => activitiesApi.sessions(activityId),
  });

  // Authoritative — the list is not scanned for an open session.
  const running = data?.running ?? null;

  // A running session ticks a clock; the elapsed time is derived from it.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const elapsed = running
    ? Math.max(0, Math.floor((now - new Date(running.startedAt).getTime()) / 1000))
    : 0;

  const start = useMutation({
    mutationFn: () => activitiesApi.startSession(activityId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', activityId] }),
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const stop = useMutation({
    mutationFn: () => activitiesApi.stopSession(activityId, running?.id as string),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', activityId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      notify(`Logged ${session.durationMinutes ?? 0} minutes`);
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (running) {
    return (
      <Button
        variant="ghost"
        className="ml-auto flex-none text-red-ink"
        icon={<Square size={16} />}
        loading={stop.isPending}
        onClick={() => stop.mutate()}
      >
        {formatClock(elapsed)}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className="ml-auto flex-none text-cyan-ink"
      icon={<Play size={18} />}
      loading={start.isPending}
      onClick={() => start.mutate()}
      title={
        data ? `${data.actualMinutes}m logged of ${data.plannedMinutes ?? '—'}m planned` : undefined
      }
    >
      Start
    </Button>
  );
}
