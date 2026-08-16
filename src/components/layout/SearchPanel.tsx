'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { searchApi } from '@/lib/api/planner';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/format';

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState('');

  const { data, isFetching } = useQuery({
    queryKey: ['search', term],
    queryFn: () => searchApi.query(term),
    enabled: open && term.trim().length > 1,
  });

  const empty = !data || (!data.activities.length && !data.goals.length && !data.notes.length);

  return (
    <Dialog open={open} onClose={onClose} title="Search">
      <Input
        autoFocus
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search activities, notes…"
        icon={<Search size={18} />}
      />

      <div className="mt-4 flex flex-col gap-4">
        {term.trim().length < 2 ? (
          <p className="text-sm text-muted">Type at least two characters to search your board.</p>
        ) : isFetching ? (
          <p className="text-sm text-muted">Searching…</p>
        ) : empty ? (
          <p className="text-sm text-muted">
            Nothing matched “{term}”. Search covers activity titles, goals and day notes.
          </p>
        ) : (
          <>
            {data.activities.length ? (
              <section className="flex flex-col gap-2">
                <h3 className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Activities</h3>
                {data.activities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.date ? '/calendar' : '/flexible'}
                    onClick={onClose}
                    className="rounded-xl border border-line-2 bg-surface-4 px-3 py-2.5 text-sm font-semibold"
                  >
                    {activity.title}
                    <span className="ml-2 text-xs font-medium text-muted">
                      {activity.date ? formatDate(activity.date) : 'Flexible'}
                    </span>
                  </Link>
                ))}
              </section>
            ) : null}

            {data.goals.length ? (
              <section className="flex flex-col gap-2">
                <h3 className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Goals</h3>
                {data.goals.map((goal) => (
                  <Link
                    key={goal.id}
                    href="/goals"
                    onClick={onClose}
                    className="rounded-xl border border-line-2 bg-surface-4 px-3 py-2.5 text-sm font-semibold"
                  >
                    {goal.title}
                  </Link>
                ))}
              </section>
            ) : null}
          </>
        )}
      </div>
    </Dialog>
  );
}
