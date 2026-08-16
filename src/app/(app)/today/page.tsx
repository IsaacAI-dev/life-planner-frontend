'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Lock, NotebookPen, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { activitiesApi } from '@/lib/api/activities';
import { chatApi } from '@/lib/api/chat';
import { ActivityDetailDialog } from '@/components/activities/ActivityDetailDialog';
import { ActivityTimer } from '@/components/activities/ActivityTimer';
import { MoodPicker } from '@/components/activities/MoodPicker';
import { PlanBanner } from '@/components/plan/PlanBanner';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardLabel } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Textarea } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants';
import { formatDuration, formatTime, greetingFor, minutesBetween, toIsoDate } from '@/lib/format';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import type { Activity } from '@/lib/types';
import { withAlpha } from '@/lib/utils';

const today = toIsoDate(new Date());

function isLiveNow(activity: Activity): boolean {
  if (!activity.startTime || !activity.endTime) return false;
  const now = new Date();
  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return activity.startTime <= clock && clock < activity.endTime;
}

function TimelineRow({
  activity,
  onToggle,
  onOpen,
}: {
  activity: Activity;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const color = activity.category?.color || FALLBACK_CATEGORY_COLOR;
  const live = isLiveNow(activity);

  return (
    <div className="flex items-stretch gap-3">
      <span className="w-14 flex-none pt-3.5 text-xs font-bold text-muted-3">
        {formatTime(activity.startTime)}
      </span>

      <div
        className="flex flex-1 items-center gap-3 rounded-xl border py-3 pr-3 pl-3.5"
        style={{
          borderColor: live ? color : 'var(--line-2)',
          background: live ? withAlpha(color, 0.12) : 'var(--surface-2)',
          borderLeftWidth: 3,
          borderLeftColor: color,
        }}
      >
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-col gap-0.5 text-left">
          <span
            className={`flex items-center gap-1.5 truncate text-sm font-bold ${
              activity.isDone ? 'text-muted line-through' : 'text-text-2'
            }`}
          >
            {activity.title}
            {activity.isPrivate ? <Lock size={13} className="flex-none text-muted-3" /> : null}
          </span>
          <span className="truncate text-xs text-muted">
            {activity.category?.name ?? 'Unsorted'} ·{' '}
            {formatDuration(minutesBetween(activity.startTime, activity.endTime))}
          </span>
        </button>

        {live ? (
          <span
            className="ml-auto flex-none rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider"
            style={{ background: withAlpha(color, 0.24), color }}
          >
            LIVE
          </span>
        ) : null}

        <button
          type="button"
          onClick={onToggle}
          aria-label={activity.isDone ? 'Mark as not done' : 'Mark as done'}
          className={live ? 'flex-none' : 'ml-auto flex-none'}
        >
          {activity.isDone ? (
            <CheckCircle2 size={22} className="text-green-ink" />
          ) : (
            <Circle size={22} className="text-muted-3" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { user } = useAuth();
  const notify = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [detail, setDetail] = useState<Activity | null>(null);
  const [mood, setMood] = useState<number | null>(null);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', today],
    queryFn: () => activitiesApi.list({ from: today, to: today }),
  });

  const { data: savedNote } = useQuery({
    queryKey: ['note', today],
    queryFn: () => activitiesApi.getNote(today),
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.conversations,
  });

  const toggle = useMutation({
    mutationFn: (id: string) => activitiesApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const clearNote = useMutation({
    mutationFn: () => activitiesApi.deleteNote(today),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', today] });
      setNote('');
      notify('Note cleared');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const saveNote = useMutation({
    mutationFn: () => activitiesApi.saveNote(today, { content: note, mood: mood ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', today] });
      notify('Note saved');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (isLoading) return <PageSkeleton />;

  const list = activities ?? [];
  const sorted = [...list].sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  const done = list.filter((activity) => activity.isDone).length;
  const plannedMinutes = list.reduce(
    (total, activity) => total + minutesBetween(activity.startTime, activity.endTime),
    0,
  );
  const upNext = sorted.find((activity) => !activity.isDone);
  const coachConversation = conversations?.find((item) => item.type === 'LIFE_COACH' && !item.locked);

  return (
    <div className="mx-auto flex max-w-320 flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {greetingFor()}, {user?.name?.split(' ')[0]}
        </h2>
        <div className="ml-auto flex items-center gap-3">
          <PlanBanner />
          <MoodPicker value={mood ?? savedNote?.mood ?? null} onChange={setMood} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-4">
          {upNext ? (
            <Card
              className="flex items-center gap-4"
              style={{ background: 'linear-gradient(120deg, var(--hero-1), var(--surface-2))' }}
            >
              <span
                className="flex size-11 flex-none items-center justify-center rounded-xl"
                style={{
                  background: withAlpha(upNext.category?.color || FALLBACK_CATEGORY_COLOR, 0.22),
                  color: upNext.category?.color || FALLBACK_CATEGORY_COLOR,
                }}
              >
                <Play size={20} />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <CardLabel>Up next</CardLabel>
                <span className="truncate font-display text-lg font-semibold">{upNext.title}</span>
                <span className="text-xs text-muted">
                  {formatTime(upNext.startTime)} – {formatTime(upNext.endTime)} ·{' '}
                  {upNext.category?.name ?? 'Unsorted'}
                </span>
              </div>
              <ActivityTimer activityId={upNext.id} />
            </Card>
          ) : null}

          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-bold">
                {done} of {list.length} <span className="font-medium text-muted">done today</span>
              </span>
              <span className="text-xs text-muted">
                {list.length} activities · {formatDuration(plannedMinutes)} planned
              </span>
            </div>
            <Progress value={done} max={list.length || 1} className="mt-3" />

            <div className="mt-5 flex flex-col gap-2.5">
              <CardLabel>Today&apos;s timeline</CardLabel>
              {sorted.length ? (
                sorted.map((activity) => (
                  <TimelineRow
                    key={activity.id}
                    activity={activity}
                    onToggle={() => toggle.mutate(activity.id)}
                    onOpen={() => setDetail(activity)}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<NotebookPen size={22} />}
                  title="Nothing planned yet"
                  description="Add your first activity for today and it will show up on this timeline."
                />
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-9 flex-none items-center justify-center rounded-xl bg-surface-4 text-violet-ink">
                <NotebookPen size={18} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Add a note for today</span>
                <span className="text-xs text-muted">How did it go? Capture a thought.</span>
              </div>
            </div>

            <Textarea
              rows={4}
              value={note || savedNote?.content || ''}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Shipped the API spec a day early — standup energy was high…"
            />

            <div className="flex items-center gap-3">
              {savedNote ? (
                <button
                  type="button"
                  onClick={() => clearNote.mutate()}
                  className="text-xs font-semibold text-muted-3 hover:text-red-ink"
                >
                  Clear
                </button>
              ) : (
                <span className="text-xs text-muted">Saving to today</span>
              )}
              <Button
                variant="accent"
                size="sm"
                className="ml-auto"
                loading={saveNote.isPending}
                onClick={() => saveNote.mutate()}
              >
                Save note
              </Button>
            </div>
          </Card>

          {coachConversation ? (
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={coachConversation.assignedAdmin?.name ?? 'Coach'}
                  src={coachConversation.assignedAdmin?.avatarUrl}
                  size={38}
                  online
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">
                    {coachConversation.assignedAdmin?.name ?? 'Your coach'}
                  </span>
                  <span className="text-xs font-semibold text-green-ink">Your coach · online now</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-text-3">
                {coachConversation.lastMessage?.content ??
                  'Say hello and tell your coach how the week is going.'}
              </p>

              <Link href="/chats" className="text-sm font-bold text-violet-ink">
                Open chat
              </Link>
            </Card>
          ) : null}
        </div>
      </div>

      <ActivityDetailDialog activity={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
