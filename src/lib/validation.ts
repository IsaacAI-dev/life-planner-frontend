/**
 * Client-side field validation for auth forms. Catches the obvious mistakes
 * (empty, malformed email, short password) before a request ever goes out, so
 * the backend's validation error is the exception, not the primary feedback
 * mechanism a person sees.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function emailError(value: string): string | null {
  if (!value.trim()) return 'Enter your email.';
  if (!EMAIL_PATTERN.test(value.trim())) return 'That doesn\u2019t look like a valid email.';
  return null;
}

export function passwordError(value: string): string | null {
  if (!value) return 'Enter a password.';
  if (value.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

export function requiredError(value: string, label: string): string | null {
  return value.trim() ? null : `Enter your ${label}.`;
}

/** Runs every validator and returns only the errors that fired. */
export function collectErrors<K extends string>(
  checks: Record<K, () => string | null>,
): Partial<Record<K, string>> {
  const errors: Partial<Record<K, string>> = {};
  (Object.keys(checks) as K[]).forEach((key) => {
    const message = checks[key]();
    if (message) errors[key] = message;
  });
  return errors;
}
