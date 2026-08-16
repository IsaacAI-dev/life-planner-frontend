'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { goalsApi } from '@/lib/api/planner';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/lib/providers/ToastProvider';

export function NewGoalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const notify = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const create = useMutation({
    mutationFn: () =>
      goalsApi.create({
        title,
        description: description || undefined,
        targetDate: targetDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      notify('Goal created');
      setTitle('');
      setDescription('');
      setTargetDate('');
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  return (
    <Dialog open={open} onClose={onClose} title="New goal">
      <div className="flex flex-col gap-4">
        <Field label="Title">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Run a half marathon"
          />
        </Field>

        <Field label="Description">
          <Textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What does finishing look like?"
          />
        </Field>

        <Field label="Target date">
          <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
        </Field>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            className="flex-1"
            loading={create.isPending}
            onClick={() => (title.trim() ? create.mutate() : notify('Give the goal a title.', 'error'))}
          >
            Create goal
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
