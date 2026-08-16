'use client';

import { useQuery } from '@tanstack/react-query';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { subscriptionApi } from '@/lib/api/subscription';
import { CountryChangeDialog } from '@/components/nutrition/CountryChangeDialog';

/**
 * Country drives pricing *and* the food catalog, so changing it here goes
 * through the same guarded preview/confirm flow as changing it from Nutrition.
 * `PUT /subscription/region` would apply it silently, which would clear someone's
 * selected foods without warning — the confirmation exists for a reason, and a
 * second unguarded path would defeat it.
 */
export function RegionPicker() {
  const [open, setOpen] = useState(false);

  const { data: catalog } = useQuery({
    queryKey: ['plans', 'WEB'],
    queryFn: () => subscriptionApi.plans('WEB'),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-line-2 bg-surface-4 px-2.5 py-1.5 text-xs font-bold text-muted"
      >
        <Globe size={14} />
        {catalog?.region ?? catalog?.country ?? '—'} · {catalog?.currency ?? ''}
      </button>

      <CountryChangeDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
