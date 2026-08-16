import { request } from '@/lib/api/client';
import type { Notification, Settings } from '@/lib/types';

export type SettingsPatch = Partial<Omit<Settings, 'notifications'>> & {
  notifications?: Partial<Settings['notifications']>;
};

export const settingsApi = {
  get: () => request<Settings>('/settings', { unwrap: 'settings' }),
  replace: (body: Settings) =>
    request<Settings>('/settings', { method: 'PUT', body, unwrap: 'settings' }),
  patch: (body: SettingsPatch) =>
    request<Settings>('/settings', { method: 'PATCH', body, unwrap: 'settings' }),
  /** Timezone is a fact about the person, not a preference, so it survives. */
  reset: () => request<Settings>('/settings/reset', { method: 'POST', body: {}, unwrap: 'settings' }),
};

export const notificationsApi = {
  list: (limit = 20) => request<Notification[]>('/notifications', { query: { limit }, unwrap: 'items' }),
  unreadCount: () => request<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) =>
    request<Notification>(`/notifications/${id}/read`, { method: 'POST', body: {}, unwrap: 'notification' }),
  markAllRead: () => request<{ ok: true }>('/notifications/read-all', { method: 'POST', body: {} }),
};

export const analyticsApi = {
  track: (body: { type?: 'PAGE_VIEW' | 'CUSTOM'; path: string; referrer?: string; sessionId?: string }) =>
    request<{ ok: true }>('/analytics/events', { method: 'POST', body }).catch(() => null),
};
