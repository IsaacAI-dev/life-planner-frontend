'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { boardsApi } from '@/lib/api/boards';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/lib/providers/ToastProvider';
import type { BoardPermission } from '@/lib/types';

const LEVELS: { value: BoardPermission; label: string; hint: string }[] = [
  { value: 'PUBLIC_ONLY', label: 'Public only', hint: 'Private activities stay hidden.' },
  { value: 'FULL', label: 'Everything', hint: 'Includes activities marked private.' },
];

export function ShareBoardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const notify = useToast();

  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<BoardPermission>('PUBLIC_ONLY');

  const grant = useMutation({
    mutationFn: () => boardsApi.grant({ viewerEmail: email, permission }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-shares'] });
      notify('Board shared');
      setEmail('');
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  return (
    <Dialog open={open} onClose={onClose} title="Share my board">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          They get read-only access straight away. You can change the level or revoke it at any time.
        </p>

        <Field label="Their email">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="kemi@dusk.app"
            icon={<Mail size={17} />}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
            What they can see
          </span>

          {LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setPermission(level.value)}
              className="flex flex-col gap-0.5 rounded-xl border px-3.5 py-3 text-left"
              style={{
                borderColor: permission === level.value ? 'var(--violet-ink-2)' : 'var(--line-2)',
                background: permission === level.value ? 'var(--surface-4)' : 'transparent',
              }}
            >
              <span className="text-sm font-bold">{level.label}</span>
              <span className="text-xs text-muted">{level.hint}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            className="flex-1"
            loading={grant.isPending}
            onClick={() => (email.trim() ? grant.mutate() : notify('Enter their email.', 'error'))}
          >
            Share board
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
