'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { CalendarDays, Clock, Lock, Pencil } from 'lucide-react';
import { useState } from 'react';
import { activitiesApi } from '@/lib/api/activities';
import { categoriesApi } from '@/lib/api/planner';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { UpgradeDialog } from '@/components/plan/UpgradeDialog';
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants';
import { toIsoDate } from '@/lib/format';
import { usePlan } from '@/lib/providers/PlanProvider';
import { useToast } from '@/lib/providers/ToastProvider';

type Mode = 'dated' | 'flexible';

const DURATIONS = [30, 45, 60, 120];

/** "07:00" + 90 minutes -> "08:30". */
function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function NewActivityDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const notify = useToast();
  const { canAddActivity } = usePlan();

  const [mode, setMode] = useState<Mode>('dated');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [startTime, setStartTime] = useState('19:00');
  const [duration, setDuration] = useState(60);
  const [windowStart, setWindowStart] = useState(toIsoDate(new Date()));
  const [windowEnd, setWindowEnd] = useState(toIsoDate(addDays(new Date(), 6)));
  const [targetCount, setTargetCount] = useState(3);
  const [isPrivate, setIsPrivate] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState('');
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const reset = () => {
    setTitle('');
    setCategoryId(null);
    setIsPrivate(false);
    setRepeatUntil('');
    setExcludeWeekends(false);
    setMode('dated');
  };

  const create = useMutation({
    mutationFn: async () => {
      if (mode === 'flexible') {
        await activitiesApi.createFlexible({
          title,
          categoryId,
          windowStart,
          windowEnd,
          targetCount,
          isPrivate,
        });
        return;
      }

      const dated = {
        title,
        date,
        startTime,
        endTime: addMinutes(startTime, duration),
        categoryId,
        isPrivate,
      };

      // A "repeat until" date turns one activity into a range in a single call.
      if (repeatUntil) {
        await activitiesApi.createBulk({
          title,
          rangeStart: date,
          rangeEnd: repeatUntil,
          startTime,
          endTime: addMinutes(startTime, duration),
          excludeWeekends,
          categoryId,
          isPrivate,
        });
      } else {
        await activitiesApi.create(dated);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      notify(
        mode === 'flexible'
          ? 'Flexible task added'
          : repeatUntil
            ? 'Activities added across the range'
            : 'Activity added',
      );
      reset();
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const submit = () => {
    if (!title.trim()) {
      notify('Give the activity a title first.', 'error');
      return;
    }
    if (!canAddActivity) {
      setLimitOpen(true);
      return;
    }
    create.mutate();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} title="New activity">
        <div className="flex flex-col gap-4">
          <SegmentedControl
            className="w-full [&>button]:flex-1"
            options={[
              { value: 'dated', label: 'On a date' },
              { value: 'flexible', label: 'Flexible' },
            ]}
            value={mode}
            onChange={setMode}
          />

          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Evening yoga"
            icon={<Pencil size={17} />}
          />

          <div className="flex flex-col gap-2">
            <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Life area</span>
            <div className="flex flex-wrap gap-2">
              {categories?.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  color={category.color || FALLBACK_CATEGORY_COLOR}
                  selected={categoryId === category.id}
                  onClick={() => setCategoryId(categoryId === category.id ? null : category.id)}
                />
              ))}
            </div>
          </div>

          {mode === 'dated' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="When">
                  <Input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    icon={<CalendarDays size={17} />}
                  />
                </Field>
                <Field label="Start">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    icon={<Clock size={17} />}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Duration</span>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setDuration(minutes)}
                      className="rounded-xl border px-2 py-2.5 text-sm font-bold"
                      style={
                        duration === minutes
                          ? { borderColor: 'var(--violet-ink-2)', background: 'var(--surface-4)', color: 'var(--text)' }
                          : { borderColor: 'var(--line-2)', color: 'var(--muted)' }
                      }
                    >
                      {minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Repeat until (optional)">
                <Input
                  type="date"
                  value={repeatUntil}
                  min={date}
                  onChange={(event) => setRepeatUntil(event.target.value)}
                />
              </Field>

              {repeatUntil ? (
                <div className="flex items-center gap-3 rounded-xl border border-line-2 bg-surface-4 px-3.5 py-3">
                  <span className="text-sm font-bold">Skip weekends</span>
                  <div className="ml-auto">
                    <Switch
                      checked={excludeWeekends}
                      onChange={setExcludeWeekends}
                      label="Skip weekends"
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Window opens">
                  <Input
                    type="date"
                    value={windowStart}
                    onChange={(event) => setWindowStart(event.target.value)}
                  />
                </Field>
                <Field label="Window closes">
                  <Input type="date" value={windowEnd} onChange={(event) => setWindowEnd(event.target.value)} />
                </Field>
              </div>
              <Field label="Times to complete">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={targetCount}
                  onChange={(event) => setTargetCount(Number(event.target.value))}
                />
              </Field>
            </>
          )}

          <div className="flex items-center gap-3 rounded-xl border border-line-2 bg-surface-4 px-3.5 py-3">
            <Lock size={17} className="text-muted" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">Keep private</span>
              <span className="text-xs text-muted">Hidden from anyone you share your board with.</span>
            </div>
            <div className="ml-auto">
              <Switch checked={isPrivate} onChange={setIsPrivate} label="Keep private" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="accent" className="flex-1" loading={create.isPending} onClick={submit}>
              Add activity
            </Button>
          </div>
        </div>
      </Dialog>

      <UpgradeDialog open={limitOpen} onClose={() => setLimitOpen(false)} reason="activities" />
    </>
  );
}
