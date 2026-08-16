'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Globe } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useToast } from '@/lib/providers/ToastProvider';

const COUNTRIES = [
  { code: 'NG', label: 'Nigeria' },
  { code: 'KE', label: 'Kenya' },
  { code: 'GH', label: 'Ghana' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'DE', label: 'Germany' },
];

/**
 * Changing country is destructive: the food catalog is per-country, so selected
 * foods stop existing, and every amount switches currency. The preview call
 * states the cost in numbers before anything is applied.
 */
export function CountryChangeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useAuth();
  const notify = useToast();
  const queryClient = useQueryClient();

  const [country, setCountry] = useState(user?.country ?? 'NG');
  const changed = country !== user?.country;

  const { data: preview, isFetching } = useQuery({
    queryKey: ['country-preview', country],
    queryFn: () => authApi.countryChangePreview(country),
    enabled: open && changed,
  });

  const apply = useMutation({
    mutationFn: () => authApi.changeCountry(country, true),
    onSuccess: (updated) => {
      setUser(updated);
      // The catalog, inventory, plans and prices are all country-scoped.
      queryClient.invalidateQueries({ queryKey: ['food-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['food-categories'] });
      queryClient.invalidateQueries({ queryKey: ['food-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      notify('Country updated');
      onClose();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  return (
    <Dialog open={open} onClose={onClose} title="Change country">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Your country decides which food catalog you see and which currency your budget uses.
        </p>

        <Field label="Country">
          <Select value={country} onChange={(event) => setCountry(event.target.value)}>
            {COUNTRIES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        {!changed ? null : isFetching ? (
          <Skeleton className="h-24" />
        ) : preview ? (
          <div
            className="flex flex-col gap-2.5 rounded-xl border p-3.5"
            style={{ borderColor: 'var(--amber-ink)', background: 'rgba(240,169,59,0.1)' }}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-amber-ink">
              <AlertTriangle size={16} />
              What this changes
            </span>

            <ul className="flex flex-col gap-1.5 text-sm text-text-3">
              {preview.warnings.length ? (
                preview.warnings.map((warning) => (
                  <li key={warning} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 flex-none rounded-full bg-amber-ink" />
                    {warning}
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-2">
                  <Globe size={14} className="flex-none text-muted" />
                  Nothing will be lost — you have no foods selected.
                </li>
              )}
            </ul>

            <p className="text-xs text-muted">
              Past budget amounts stay exactly as recorded. Only the symbol in front of them changes.
            </p>
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            className="flex-1"
            disabled={!changed}
            loading={apply.isPending}
            onClick={() => apply.mutate()}
          >
            {preview && preview.selectedMealsRemoved > 0 ? 'Change and clear' : 'Change country'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
