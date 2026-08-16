'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { categoriesApi, tagsApi } from '@/lib/api/planner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FALLBACK_CATEGORY_COLOR } from '@/lib/constants';
import { useToast } from '@/lib/providers/ToastProvider';

const SWATCHES = ['#A78BFA', '#38D6EE', '#5BE49B', '#F0A93B', '#F472B6', '#FB923C'];

/** Life areas and tags share the same add/recolour/remove shape. */
export function ListManager({ kind }: { kind: 'categories' | 'tags' }) {
  const queryClient = useQueryClient();
  const notify = useToast();
  const isCategories = kind === 'categories';

  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);

  const queryKey = [kind];
  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const { data } = useQuery({
    queryKey,
    queryFn: isCategories ? categoriesApi.list : tagsApi.list,
  });

  const create = useMutation({
    mutationFn: () =>
      isCategories ? categoriesApi.create({ name, color }) : tagsApi.create({ name, color }),
    onSuccess: () => {
      invalidate();
      setName('');
      notify(isCategories ? 'Life area added' : 'Tag added');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const recolour = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) =>
      isCategories ? categoriesApi.update(id, { color: next }) : tagsApi.update(id, { color: next }),
    onSuccess: invalidate,
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => (isCategories ? categoriesApi.remove(id) : tagsApi.remove(id)),
    onSuccess: () => {
      invalidate();
      notify('Removed');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        {isCategories
          ? 'Life areas colour your calendar and group your time on Insights.'
          : 'Tags are free-form labels you can attach to any activity.'}
      </p>

      <div className="flex flex-col gap-2">
        {data?.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line-2 bg-surface-3 px-3 py-2.5"
          >
            <span
              className="size-3 flex-none rounded-full"
              style={{ background: item.color || FALLBACK_CATEGORY_COLOR }}
            />
            <span className="text-sm font-bold">{item.name}</span>

            <div className="ml-auto flex items-center gap-1.5">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => recolour.mutate({ id: item.id, next: swatch })}
                  aria-label={`Recolour ${item.name}`}
                  className="size-4 rounded-full"
                  style={{
                    background: swatch,
                    outline: item.color === swatch ? '2px solid var(--text-3)' : undefined,
                    outlineOffset: 1,
                  }}
                />
              ))}

              <button
                type="button"
                onClick={() => remove.mutate(item.id)}
                aria-label={`Delete ${item.name}`}
                className="ml-1.5 flex size-8 items-center justify-center rounded-lg border border-line-2 text-muted-3"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="min-w-40 flex-1"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={isCategories ? 'Fitness' : 'deep-work'}
        />

        <div className="flex gap-1.5">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              aria-label={`Use ${swatch}`}
              className="size-6 rounded-full"
              style={{
                background: swatch,
                outline: color === swatch ? '2px solid var(--text-3)' : undefined,
                outlineOffset: 1,
              }}
            />
          ))}
        </div>

        <Button
          variant="solid"
          icon={<Plus size={16} />}
          disabled={!name.trim()}
          loading={create.isPending}
          onClick={() => create.mutate()}
        >
          Add
        </Button>
      </div>
    </Card>
  );
}
