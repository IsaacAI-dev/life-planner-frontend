'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/lib/providers/ToastProvider';
import { emailError } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const notify = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const message = emailError(email);
    setError(message);
    if (message) return;

    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not send the reset link.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted">
          {sent
            ? 'If that email is on file, a reset link is on its way. The link expires in an hour.'
            : 'Enter the email on your account and we will send a reset link.'}
        </p>
      </div>

      {sent ? null : (
        <>
          <Field label="Email" error={error}>
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => event.key === 'Enter' && submit()}
              invalid={Boolean(error)}
              placeholder="ada@dusk.app"
              icon={<Mail size={17} />}
            />
          </Field>
          <Button variant="accent" size="lg" loading={submitting} onClick={submit}>
            Send reset link
          </Button>
        </>
      )}

      <Link href="/sign-in" className="text-sm font-bold text-violet-ink">
        Back to sign in
      </Link>
    </div>
  );
}
