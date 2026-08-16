'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Lock } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/lib/providers/ToastProvider';
import { passwordError } from '@/lib/validation';

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const notify = useToast();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!token) {
      notify('This reset link is missing its token. Request a new one.', 'error');
      return;
    }

    const message = passwordError(password);
    setError(message);
    if (message) return;

    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      notify('Password updated. Sign in with your new password.');
      router.push('/sign-in');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not reset the password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight">Choose a new password</h1>
        <p className="text-sm text-muted">Use at least 8 characters.</p>
      </div>

      <Field label="New password" error={error}>
        <Input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
          invalid={Boolean(error)}
          icon={<Lock size={17} />}
        />
      </Field>

      <Button variant="accent" size="lg" loading={submitting} onClick={submit}>
        Save new password
      </Button>

      <Link href="/sign-in" className="text-sm font-bold text-violet-ink">
        Back to sign in
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
