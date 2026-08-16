'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { categoriesApi, recurringApi } from '@/lib/api/planner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input, Select } from '@/components/ui/Input';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants';
import { formatTime } from '@/lib/format';
import { useToast } from '@/lib/providers/ToastProvider';

/** Presets cover the common cases without asking anyone to write an RRULE. */
const PATTERNS = [
  { rrule: 'FREQ=DAILY', label: 'Every day' },
  { rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', label: 'Weekdays' },
  { rrule: 'FREQ=WEEKLY;BYDAY=SA,SU', label: 'Weekends' },
  { rrule: 'FREQ=WEEKLY', label: 'Every week' },
  { rrule: 'FREQ=MONTHLY', label: 'Every month' },
];

function describeRrule(rrule: string): string {
  return PATTERNS.find((pattern) => pattern.rrule === rrule)?.label ?? rrule;
}

export default function RecurringPage() {
  const queryClient = useQueryClient();
  const notify = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [rrule, setRrule] = useState(PATTERNS[0].rrule);
  const [startTime, setStartTime] = useState('07:00');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['recurring'], queryFn: recurringApi.list });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['recurring'] });

  const create = useMutation({
    mutationFn: () => recurringApi.create({ title, rrule, startTime, categoryId }),
    onSuccess: () => {
      invalidate();
      notify('Repeating activity created');
      setTitle('');
      setDialogOpen(false);
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      recurringApi.update(id, { active }),
    onSuccess: invalidate,
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => recurringApi.remove(id),
    onSuccess: () => {
      invalidate();
      notify('Template removed');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-3xl font-bold tracking-tight">Repeating</h2>
          <p className="text-sm text-muted">
            Templates that put an activity on your calendar on a schedule.
          </p>
        </div>
        <Button
          variant="solid"
          className="ml-auto"
          icon={<Plus size={17} />}
          onClick={() => setDialogOpen(true)}
        >
          New template
        </Button>
      </div>

      {data?.length ? (
        <div className="flex flex-col gap-2.5">
          {data.map((template) => {
            const color = template.category?.color || FALLBACK_CATEGORY_COLOR;

            return (
              <Card key={template.id} className="flex flex-wrap items-center gap-3">
                <span className="size-2.5 flex-none rounded-full" style={{ background: color }} />

                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold">{template.title}</span>
                  <span className="truncate text-xs text-muted">
                    {describeRrule(template.rrule)}
                    {template.startTime ? ` · ${formatTime(template.startTime)}` : ''}
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-2.5">
                  <Switch
                    label={`${template.title} active`}
                    checked={template.active}
                    onChange={(active) => toggleActive.mutate({ id: template.id, active })}
                  />
                  <button
                    type="button"
                    onClick={() => remove.mutate(template.id)}
                    aria-label={`Delete ${template.title}`}
                    className="flex size-8 items-center justify-center rounded-lg border border-line-2 text-muted-3"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarClock size={22} />}
          title="Nothing repeats yet"
          description="Set up a template for anything you do on a schedule and it will appear on your calendar automatically."
          action={
            <Button variant="accent" onClick={() => setDialogOpen(true)}>
              Create a template
            </Button>
          }
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New repeating activity">
        <div className="flex flex-col gap-4">
          <Field label="Title">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Morning run"
            />
          </Field>

          <Field label="How often">
            <Select value={rrule} onChange={(event) => setRrule(event.target.value)}>
              {PATTERNS.map((pattern) => (
                <option key={pattern.rrule} value={pattern.rrule}>
                  {pattern.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Start time">
            <Input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
              Life area
            </span>
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

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              className="flex-1"
              loading={create.isPending}
              onClick={() => (title.trim() ? create.mutate() : notify('Give it a title.', 'error'))}
            >
              Create
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
