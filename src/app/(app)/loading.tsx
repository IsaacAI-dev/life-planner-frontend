import { BootScreen } from '@/components/layout/BootScreen';

/**
 * Next's route-level loading boundary — shows immediately on navigation into
 * any signed-in screen, before the segment's data has resolved. This is what
 * AppShell's own `loading` check (the client-side auth resolution) cannot
 * cover on its own: a fast, guaranteed splash on every transition into the
 * app, not just the first one.
 */
export default function AppLoading() {
  return <BootScreen />;
}
