'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Check, Copy, Link2, Monitor, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { settingsApi } from '@/lib/api/account';
import { calendarSyncApi } from '@/lib/api/planner';
import { Button } from '@/components/ui/Button';
import { Card, CardLabel } from '@/components/ui/Card';
import { ListManager } from '@/components/settings/ListManager';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { TEXT_SCALE_ORDER } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import type { CoachCheckInFrequency, TextScale } from '@/lib/types';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Device default' },
] as const;

const SCALE_LABELS: Record<TextScale, string> = {
  SMALL: 'Small',
  DEFAULT: 'Default',
  LARGE: 'Large',
  LARGEST: 'Largest',
};

const CHECK_IN_OPTIONS: { value: CoachCheckInFrequency; label: string }[] = [
  { value: 'OFF', label: 'Off' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
];

function ThemePreview({ mode }: { mode: 'light' | 'dark' | 'system' }) {
  const surface = mode === 'light' ? '#FFFFFF' : '#1A1626';
  const line = mode === 'light' ? '#E7E1F3' : '#2A2540';

  return (
    <div
      className="flex h-20 w-full gap-1 overflow-hidden rounded-lg border p-2"
      style={{ background: mode === 'light' ? '#F7F5FC' : '#141019', borderColor: line }}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-2 w-2/3 rounded-full" style={{ background: line }} />
        <div className="h-2 w-full rounded-full" style={{ background: surface }} />
        <div className="h-2 w-4/5 rounded-full" style={{ background: surface }} />
        <div
          className="mt-auto h-3 w-1/2 rounded-full"
          style={{ background: 'linear-gradient(90deg,#F472B6,#A78BFA,#34DDE0)' }}
        />
      </div>
      {mode === 'system' ? <div className="w-1/3 rounded" style={{ background: '#1A1626' }} /> : null}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme, textScale, setTextScale } = useTheme();
  const notify = useToast();
  const queryClient = useQueryClient();
  const [icsUrl, setIcsUrl] = useState('');

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const { data: feed } = useQuery({ queryKey: ['ical-feed'], queryFn: calendarSyncApi.feedUrl });
  const { data: connections } = useQuery({
    queryKey: ['calendar-connections'],
    queryFn: calendarSyncApi.listConnections,
  });

  const patchSettings = useMutation({
    mutationFn: settingsApi.patch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      notify('Settings saved');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const resetSettings = useMutation({
    mutationFn: settingsApi.reset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      notify('Settings reset to defaults');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const connectIcs = useMutation({
    mutationFn: () =>
      calendarSyncApi.connect({ provider: 'ICS', url: icsUrl, label: 'Imported calendar' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-connections'] });
      setIcsUrl('');
      notify('Calendar connected');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const disconnect = useMutation({
    mutationFn: (id: string) => calendarSyncApi.disconnect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-connections'] });
      notify('Calendar disconnected');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  /** Theme and text size apply locally at once, then persist for other devices. */
  const applyTextScale = (scale: TextScale) => {
    setTextScale(scale);
    patchSettings.mutate({ textScale: scale });
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight">Settings</h2>
        <Button
          variant="outline"
          className="ml-auto"
          icon={<RotateCcw size={16} />}
          loading={resetSettings.isPending}
          onClick={() => resetSettings.mutate()}
        >
          Reset to defaults
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        <CardLabel>Theme</CardLabel>
        <Card>
          <div className="grid gap-3 sm:grid-cols-3">
            {THEMES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  patchSettings.mutate({ theme: option.value });
                }}
                className="flex flex-col gap-2.5 rounded-xl border p-2.5 text-left"
                style={{
                  borderColor: theme === option.value ? 'var(--violet-ink-2)' : 'var(--line-2)',
                  background: theme === option.value ? 'var(--surface-4)' : 'transparent',
                }}
              >
                <ThemePreview mode={option.value} />
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  {option.label}
                  {theme === option.value ? <Check size={15} className="text-violet-ink" /> : null}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3 flex items-center gap-2 text-xs text-muted">
            <Monitor size={15} />
            Your theme is saved to your account, so it follows you across devices.
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-2.5">
        <CardLabel>Text size</CardLabel>
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">App text size</span>
            <span className="text-xs font-semibold text-violet-ink">{SCALE_LABELS[textScale]}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">A</span>
            {TEXT_SCALE_ORDER.map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => applyTextScale(scale)}
                aria-label={SCALE_LABELS[scale]}
                className="flex-1"
              >
                <span
                  className="mx-auto block size-3 rounded-full"
                  style={{ background: textScale === scale ? 'var(--violet-ink)' : 'var(--surface-4)' }}
                />
              </button>
            ))}
            <span className="text-lg font-bold text-muted">A</span>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-2.5">
        <CardLabel>Coach check-ins</CardLabel>
        <Card className="flex flex-wrap items-center gap-2">
          <span className="mr-auto text-sm text-muted">How often your coach nudges you.</span>
          {CHECK_IN_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              color="var(--violet-ink)"
              selected={settings?.coachCheckInFrequency === option.value}
              onClick={() => patchSettings.mutate({ coachCheckInFrequency: option.value })}
            />
          ))}
        </Card>
      </div>

      <div className="flex flex-col gap-2.5">
        <CardLabel>Life areas</CardLabel>
        <ListManager kind="categories" />
      </div>

      <div className="flex flex-col gap-2.5">
        <CardLabel>Tags</CardLabel>
        <ListManager kind="tags" />
      </div>

      <div className="flex flex-col gap-2.5">
        <CardLabel>Notifications</CardLabel>
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold">Email</span>
              <span className="text-xs text-muted">Reminders and coach replies by email.</span>
            </div>
            <div className="ml-auto">
              <Switch
                label="Email notifications"
                checked={settings?.notifications.email ?? false}
                onChange={(checked) => patchSettings.mutate({ notifications: { email: checked } })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-line pt-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold">Push</span>
              <span className="text-xs text-muted">Alerts on this device.</span>
            </div>
            <div className="ml-auto">
              <Switch
                label="Push notifications"
                checked={settings?.notifications.push ?? false}
                onChange={(checked) => patchSettings.mutate({ notifications: { push: checked } })}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-2.5">
        <CardLabel>Connected calendars</CardLabel>
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Imported events show on your calendar as a read-only overlay. They are never editable, do
            not count toward your weekly limit and do not affect streaks.
          </p>

          {connections?.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center gap-3 rounded-xl border border-line-2 bg-surface-3 px-3.5 py-3"
            >
              <CalendarCheck size={17} className="flex-none text-cyan-ink" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold">{connection.label}</span>
                <span className="text-xs text-muted">
                  {connection.provider}
                  {connection.lastSyncedAt
                    ? ` · synced ${formatDate(connection.lastSyncedAt, 'd MMM HH:mm')}`
                    : ' · not synced yet'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => disconnect.mutate(connection.id)}
                aria-label={`Disconnect ${connection.label}`}
                className="ml-auto flex size-8 flex-none items-center justify-center rounded-lg border border-line-2 text-muted-3"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-50 flex-1"
              value={icsUrl}
              onChange={(event) => setIcsUrl(event.target.value)}
              placeholder="https://example.com/basic.ics"
              icon={<Link2 size={17} />}
            />
            <Button
              variant="solid"
              disabled={!icsUrl.trim()}
              loading={connectIcs.isPending}
              onClick={() => connectIcs.mutate()}
            >
              Add feed
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-2.5">
        <CardLabel>Share your calendar</CardLabel>
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Subscribe to your board from any calendar app. Private activities are never included.
          </p>

          <div className="flex items-center gap-2 rounded-xl border border-line-3 bg-surface-input px-3 py-2.5">
            <span className="flex-1 truncate text-xs text-muted">{feed?.url ?? 'No feed URL yet'}</span>
            <button
              type="button"
              aria-label="Copy feed URL"
              onClick={() => {
                if (feed?.url) {
                  navigator.clipboard.writeText(feed.url);
                  notify('Feed URL copied');
                }
              }}
              className="text-muted-3"
            >
              <Copy size={16} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
