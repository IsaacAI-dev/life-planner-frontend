'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field, Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import { collectErrors, emailError, passwordError, requiredError } from '@/lib/validation';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const notify = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; agreed?: string }>({});

  // Falls back to a plain sentence if the backend copy isn't reachable — the
  // full text always lives on /terms and /privacy either way.
  const { data: consent } = useQuery({ queryKey: ['legal-consent'], queryFn: publicApi.legalConsent });

  const submit = async () => {
    const fieldErrors = collectErrors({
      name: () => requiredError(name, 'full name'),
      email: () => emailError(email),
      password: () => passwordError(password),
      agreed: () => (agreed ? null : 'You need to agree before continuing.'),
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signUp(name, email, password);
      router.push('/today');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not create the account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-medium text-muted">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-bold text-violet-ink">
          Sign in
        </Link>
      </p>

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-bold tracking-tight">Start your board</h1>
        <p className="text-sm text-muted">One board for your days, goals and habits.</p>
      </div>

      <Field label="Full name" error={errors.name}>
        <Input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
          }}
          invalid={Boolean(errors.name)}
          placeholder="Ada Lovelace"
          icon={<User size={17} />}
        />
      </Field>

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
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
          }}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
          invalid={Boolean(errors.password)}
          placeholder="At least 8 characters"
          icon={<Lock size={17} />}
        />
      </Field>

      <Checkbox
        checked={agreed}
        onChange={(checked) => {
          setAgreed(checked);
          if (errors.agreed) setErrors((current) => ({ ...current, agreed: undefined }));
        }}
        error={errors.agreed}
        label={
          <>
            {consent?.summary ?? 'I agree to the'}{' '}
            <Link href="/terms" className="font-bold text-violet-ink" target="_blank">
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-bold text-violet-ink" target="_blank">
              Privacy Policy
            </Link>
            .
          </>
        }
      />

      <Button variant="accent" size="lg" loading={submitting} onClick={submit}>
        Create account
      </Button>
    </div>
  );
}
