'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellPlus, History, Lock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { activitiesApi } from '@/lib/api/activities';
import { remindersApi } from '@/lib/api/planner';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Input, Select } from '@/components/ui/Input';
import { formatDate, formatDuration, formatTime, minutesBetween } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';
import type { Activity, ActivityChangeType } from '@/lib/types';

const CHANGE_LABELS: Record<ActivityChangeType, string> = {
  CREATED: 'Created',
  UPDATED: 'Edited',
  TOGGLED: 'Marked done or undone',
  DELETED: 'Deleted',
  DELETED_BY_ADMIN: 'Deleted by an admin',
};

interface ActivityDetailDialogProps {
  activity: Activity | null;
  onClose: () => void;
}

export function ActivityDetailDialog({ activity, onClose }: ActivityDetailDialogProps) {
  const queryClient = useQueryClient();
  const notify = useToast();

  const [remindAt, setRemindAt] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'PUSH'>('PUSH');

  const open = activity !== null;

  const { data: history } = useQuery({
    queryKey: ['activity-history', activity?.id],
    queryFn: () => activitiesApi.history(activity!.id),
    enabled: open,
  });

  // Scoped server-side rather than fetching every reminder and filtering here.
  const { data: reminders } = useQuery({
    queryKey: ['reminders', activity?.id],
    queryFn: () => remindersApi.list({ activityId: activity!.id }),
    enabled: open,
  });

  const addReminder = useMutation({
    mutationFn: () =>
      remindersApi.create({ activityId: activity!.id, remindAt, channel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      notify('Reminder set');
      setRemindAt('');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const removeReminder = useMutation({
    mutationFn: (id: string) => remindersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const deleteActivity = useMutation({
    mutationFn: () => activitiesApi.remove(activity!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      notify('Activity deleted');
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const own = reminders ?? [];

  return (
    <Dialog open={open} onClose={onClose} title={activity?.title ?? ''}>
      {activity ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold">{activity.category?.name ?? 'Unsorted'}</span>
            {activity.date ? (
              <span>
                · {formatDate(activity.date, 'EEE d MMM')} · {formatTime(activity.startTime)} ·{' '}
                {formatDuration(minutesBetween(activity.startTime, activity.endTime))}
              </span>
            ) : (
              <span>
                · flexible · {activity.completedCount}/{activity.targetCount}
              </span>
            )}
            {activity.isPrivate ? (
              <span className="flex items-center gap-1">
                <Lock size={12} /> private
              </span>
            ) : null}
          </div>

          {activity.description ? (
            <p className="text-sm text-text-3">{activity.description}</p>
          ) : null}

          <section className="flex flex-col gap-2">
            <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
              Reminders
            </span>

            {own.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-2.5 rounded-xl border border-line-2 bg-surface-3 px-3 py-2.5"
              >
                <span className="text-sm font-semibold">
                  {formatDate(reminder.remindAt, 'd MMM, HH:mm')}
                </span>
                <span className="text-xs text-muted">{reminder.channel.toLowerCase()}</span>
                {reminder.sentAt ? (
                  <span className="text-xs text-green-ink">sent</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeReminder.mutate(reminder.id)}
                  aria-label="Remove reminder"
                  className="ml-auto text-muted-3"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <div className="flex flex-wrap items-end gap-2">
              <Field label="Remind me at">
                <Input
                  type="datetime-local"
                  value={remindAt}
                  onChange={(event) => setRemindAt(event.target.value)}
                />
              </Field>
              <Select
                className="w-auto"
                value={channel}
                onChange={(event) => setChannel(event.target.value as 'EMAIL' | 'PUSH')}
              >
                <option value="PUSH">Push</option>
                <option value="EMAIL">Email</option>
              </Select>
              <Button
                variant="solid"
                icon={<BellPlus size={16} />}
                disabled={!remindAt}
                loading={addReminder.isPending}
                onClick={() => addReminder.mutate()}
              >
                Add
              </Button>
            </div>
          </section>

          {history?.length ? (
            <section className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
                <History size={13} />
                History
              </span>

              {history.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-0.5 border-l-2 border-line-2 pl-3">
                  <span className="text-sm font-semibold text-text-3">
                    {CHANGE_LABELS[entry.changeType] ?? entry.changeType}
                  </span>
                  <span className="text-[11px] text-muted-3">
                    {entry.adminId ? 'by your coach' : 'by you'} ·{' '}
                    {formatDate(entry.createdAt, 'd MMM, HH:mm')}
                  </span>
                </div>
              ))}
            </section>
          ) : null}

          <Button
            variant="danger"
            loading={deleteActivity.isPending}
            onClick={() => deleteActivity.mutate()}
          >
            Delete activity
          </Button>
        </div>
      ) : null}
    </Dialog>
  );
}
