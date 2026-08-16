'use client';

import { useCallback, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * Reads a string value from localStorage without a setState-in-effect round
 * trip. The server snapshot is always the fallback, so SSR output matches the
 * first client render and the stored value is picked up on hydration.
 */
export function useLocalStorage<T extends string>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => (localStorage.getItem(key) as T | null) ?? fallback,
    () => fallback,
  );

  const setValue = useCallback(
    (next: T | null) => {
      if (next === null) localStorage.removeItem(key);
      else localStorage.setItem(key, next);
      listeners.forEach((listener) => listener());
    },
    [key],
  );

  return [value, setValue] as const;
}

/** Tracks the OS colour-scheme preference for the "device default" theme. */
export function useSystemPrefersLight(): boolean {
  return useSyncExternalStore(
    (listener) => {
      const query = window.matchMedia('(prefers-color-scheme: light)');
      query.addEventListener('change', listener);
      return () => query.removeEventListener('change', listener);
    },
    () => window.matchMedia('(prefers-color-scheme: light)').matches,
    () => false,
  );
}
