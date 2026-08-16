'use client';

import { createContext, use, useEffect, type ReactNode } from 'react';
import { STORAGE_KEYS, TEXT_SCALE_VALUES } from '@/lib/constants';
import { useLocalStorage, useSystemPrefersLight } from '@/lib/hooks/useLocalStorage';
import type { TextScale } from '@/lib/types';

type ThemeChoice = 'light' | 'dark' | 'system';

interface ThemeValue {
  theme: ThemeChoice;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeChoice) => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<ThemeChoice>(STORAGE_KEYS.theme, 'dark');
  const [textScale, setTextScale] = useLocalStorage<TextScale>(STORAGE_KEYS.textScale, 'DEFAULT');
  const prefersLight = useSystemPrefersLight();

  // Derived during render, so there is no state to keep in sync.
  const resolvedTheme = theme === 'system' ? (prefersLight ? 'light' : 'dark') : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', String(TEXT_SCALE_VALUES[textScale]));
  }, [textScale]);

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme, textScale, setTextScale }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme(): ThemeValue {
  const value = use(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
