import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Outfit } from 'next/font/google';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { PlanProvider } from '@/lib/providers/PlanProvider';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { ThemeProvider } from '@/lib/providers/ThemeProvider';
import { ToastProvider } from '@/lib/providers/ToastProvider';
import { STORAGE_KEYS } from '@/lib/constants';
import './globals.css';

/**
 * Runs before hydration so the very first paint already matches the stored
 * preference. The fallback is 'dark' — the app never defaults to light; if a
 * signed-out visitor sees light on first load, a prior session on this origin
 * left 'light' in localStorage, which this script would then read back
 * faithfully rather than override.
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('${STORAGE_KEYS.theme}');
    var theme = stored === 'light' || stored === 'dark' ? stored
      : stored === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light'
      : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken', display: 'swap' });

export const metadata: Metadata = {
  title: 'Life Planner',
  description: 'A calm canvas for a colorful life.',
  icons: { icon: '/logo.svg', apple: '/apple-icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#141019',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${outfit.variable} ${hanken.variable}`}>
        <QueryProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <PlanProvider>{children}</PlanProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
