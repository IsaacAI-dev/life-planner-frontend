'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import { collectErrors, emailError, requiredError } from '@/lib/validation';

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const notify = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = async () => {
    const fieldErrors = collectErrors({
      email: () => emailError(email),
      password: () => requiredError(password, 'password'),
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push('/today');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not sign in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-medium text-muted">
        New to Life Planner?{' '}
        <Link href="/sign-up" className="font-bold text-violet-ink">
          Create an account
        </Link>
      </p>

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted">Sign in to pick up where your week left off.</p>
      </div>

      <Field label="Email" error={errors.email}>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
          }}
          invalid={Boolean(errors.email)}
          placeholder="ada@dusk.app"
          icon={<Mail size={17} />}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <Input
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
          }}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
          invalid={Boolean(errors.password)}
          placeholder="••••••••"
          icon={<Lock size={17} />}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-muted-3"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />
      </Field>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-bold text-violet-ink">
          Forgot password?
        </Link>
      </div>

      <Button variant="accent" size="lg" loading={submitting} onClick={submit}>
        Sign in
      </Button>

      <p className="flex items-center justify-center gap-2 text-xs font-medium text-muted-3">
        <ShieldCheck size={15} />
        Your board stays private until you share it.
      </p>
    </div>
  );
}
