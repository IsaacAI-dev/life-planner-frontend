import { request } from '@/lib/api/client';
import type {
  Activity,
  ActivityHistoryEntry,
  ActivitySession,
  ActivitySessions,
  CalendarRange,
  DayNote,
} from '@/lib/types';

export interface CreateActivityBody {
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  categoryId?: string | null;
  goalId?: string | null;
  tags?: string[];
  isPrivate?: boolean;
}

export interface CreateFlexibleBody {
  title: string;
  description?: string;
  categoryId?: string | null;
  goalId?: string | null;
  tags?: string[];
  isPrivate?: boolean;
  windowStart: string;
  windowEnd: string;
  targetCount: number;
}

export const activitiesApi = {
  list: (query: { from?: string; to?: string; done?: boolean; flexible?: boolean; activeOn?: string }) =>
    request<Activity[]>('/activities', { query, unwrap: 'activities' }),

  get: (id: string) => request<Activity>(`/activities/${id}`, { unwrap: 'activity' }),

  create: (body: CreateActivityBody) =>
    request<Activity>('/activities', { method: 'POST', body, unwrap: 'activity' }),

  createFlexible: (body: CreateFlexibleBody) =>
    request<Activity>('/activities/flexible', { method: 'POST', body, unwrap: 'activity' }),

  update: (id: string, body: Partial<CreateActivityBody>) =>
    request<Activity>(`/activities/${id}`, { method: 'PATCH', body, unwrap: 'activity' }),

  toggle: (id: string) =>
    request<Activity>(`/activities/${id}/toggle`, { method: 'PATCH', body: {}, unwrap: 'activity' }),

  logProgress: (id: string, increment = 1) =>
    request<Activity>(`/activities/${id}/progress`, {
      method: 'PATCH',
      body: { increment },
      unwrap: 'activity',
    }),

  /** Creates the same activity across a date range in one call. */
  createBulk: (body: {
    title: string;
    rangeStart: string;
    rangeEnd: string;
    startTime?: string;
    endTime?: string;
    excludeWeekends?: boolean;
    batchTitle?: string;
    categoryId?: string | null;
    isPrivate?: boolean;
  }) => request<Activity[]>('/activities/bulk', { method: 'POST', body, unwrap: 'activities' }),

  history: (id: string) =>
    request<ActivityHistoryEntry[]>(`/activities/${id}/history`, { unwrap: 'history' }),

  reorder: (date: string, orderedIds: string[]) =>
    request<{ ok: true }>('/activities/reorder', { method: 'POST', body: { date, orderedIds } }),

  remove: (id: string) => request<{ ok: true }>(`/activities/${id}`, { method: 'DELETE' }),

  calendar: (query: { from: string; to: string }) =>
    request<CalendarRange>('/calendar', { query }),

  week: (start: string) => request<CalendarRange>('/calendar/week', { query: { start } }),

  getNote: (date: string) => request<DayNote | null>(`/days/${date}/note`, { unwrap: 'note' }),

  saveNote: (date: string, body: { content: string; mood?: number }) =>
    request<DayNote>(`/days/${date}/note`, { method: 'PUT', body, unwrap: 'note' }),

  deleteNote: (date: string) => request<{ ok: true }>(`/days/${date}/note`, { method: 'DELETE' }),

  startSession: (id: string) =>
    request<ActivitySession>(`/activities/${id}/sessions`, {
      method: 'POST',
      body: {},
      unwrap: 'session',
    }),

  stopSession: (id: string, sessionId: string) =>
    request<ActivitySession>(`/activities/${id}/sessions/${sessionId}/stop`, {
      method: 'POST',
      body: {},
      unwrap: 'session',
    }),

  /** Returns the open session and aggregates alongside the list. */
  sessions: (id: string) => request<ActivitySessions>(`/activities/${id}/sessions`),
};
