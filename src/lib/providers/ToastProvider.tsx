'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createContext, use, useCallback, useState, type ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'error';
}

const ToastContext = createContext<((message: string, tone?: Toast['tone']) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4000);
  }, []);

  return (
    <ToastContext value={notify}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 flex-col gap-2 sm:bottom-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              role="status"
              className="rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg"
              style={{
                background: 'var(--surface-2)',
                borderColor: toast.tone === 'error' ? 'var(--red-ink)' : 'var(--line-2)',
                color: toast.tone === 'error' ? 'var(--red-ink)' : 'var(--text-2)',
              }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const value = use(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
