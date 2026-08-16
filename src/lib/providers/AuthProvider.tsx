'use client';

import { useRouter } from 'next/navigation';
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import { tokenStore } from '@/lib/api/client';
import type { User } from '@/lib/types';

interface AuthValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (tokenStore.access()) setUser(await authApi.me());
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await authApi.login({ email, password });
    tokenStore.save(session.tokens.accessToken, session.tokens.refreshToken);
    setUser(session.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const session = await authApi.register({ name, email, password, timezone });
    tokenStore.save(session.tokens.accessToken, session.tokens.refreshToken);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = tokenStore.refresh();
    if (refreshToken) await authApi.logout(refreshToken).catch(() => null);
    tokenStore.clear();
    setUser(null);
    router.push('/sign-in');
  }, [router]);

  return (
    <AuthContext value={{ user, loading, signIn, signUp, signOut, setUser }}>{children}</AuthContext>
  );
}

export function useAuth(): AuthValue {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
