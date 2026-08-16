'use client';

import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Mail, MailPlus } from 'lucide-react';
import { useState } from 'react';
import { subscriptionApi } from '@/lib/api/subscription';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { BeneficiaryCheck } from '@/lib/types';

interface BeneficiaryFieldsProps {
  count: number;
  emails: string[];
  onChange: (emails: string[]) => void;
  onValidityChange: (valid: boolean) => void;
}

/**
 * Beneficiaries are checked before payment, so we never take money we cannot
 * honour. An address already paying for Pro is refused; an unknown one is fine
 * and simply gets an emailed invitation.
 */
export function BeneficiaryFields({
  count,
  emails,
  onChange,
  onValidityChange,
}: BeneficiaryFieldsProps) {
  const [results, setResults] = useState<BeneficiaryCheck[] | null>(null);

  const validate = useMutation({
    mutationFn: () => subscriptionApi.validateBeneficiaries(emails.filter(Boolean)),
    onSuccess: (checks) => {
      setResults(checks);
      onValidityChange(checks.every((check) => check.ok));
    },
    onError: () => {
      setResults(null);
      onValidityChange(false);
    },
  });

  const setEmail = (index: number, value: string) => {
    const next = [...emails];
    next[index] = value;
    onChange(next);
    setResults(null);
    onValidityChange(false);
  };

  const filled = emails.filter(Boolean).length === count;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">
        Who else is on the plan
      </span>

      {Array.from({ length: count }, (_, index) => {
        const result = results?.find((check) => check.email === emails[index]);

        return (
          <div key={index} className="flex flex-col gap-1.5">
            <Input
              type="email"
              value={emails[index] ?? ''}
              onChange={(event) => setEmail(index, event.target.value)}
              placeholder="partner@example.com"
              icon={<Mail size={17} />}
            />

            {result ? (
              <span
                className="flex items-start gap-1.5 text-xs font-semibold"
                style={{ color: result.ok ? 'var(--green-ink)' : 'var(--red-ink)' }}
              >
                {result.ok ? (
                  result.willBeInvited ? (
                    <MailPlus size={14} className="mt-0.5 flex-none" />
                  ) : (
                    <CheckCircle2 size={14} className="mt-0.5 flex-none" />
                  )
                ) : (
                  <AlertCircle size={14} className="mt-0.5 flex-none" />
                )}
                {result.message ??
                  (result.willBeInvited
                    ? 'No account yet — they will be emailed an invitation.'
                    : 'Ready to be added.')}
              </span>
            ) : null}
          </div>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        className="self-start"
        disabled={!filled}
        loading={validate.isPending}
        onClick={() => validate.mutate()}
      >
        Check these addresses
      </Button>

      <p className="text-xs text-muted">
        A seat grants Pro, never access. Nobody on the plan can see anyone else&apos;s board unless
        they choose to share it.
      </p>
    </div>
  );
}
