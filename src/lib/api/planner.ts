import { request } from '@/lib/api/client';
import type {
  CalendarConnection,
  CalendarProvider,
  Category,
  CategoryStat,
  CoachInsight,
  DailyActivityPoint,
  Goal,
  Milestone,
  SearchResults,
  MoodSeries,
  RecurringTemplate,
  Reminder,
  StatsOverview,
  StreakStats,
  Tag,
} from '@/lib/types';

export const categoriesApi = {
  list: () => request<Category[]>('/categories', { unwrap: 'categories' }),
  create: (body: { name: string; color: string; icon?: string }) =>
    request<Category>('/categories', { method: 'POST', body, unwrap: 'category' }),
  update: (id: string, body: { name?: string; color?: string; icon?: string }) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body, unwrap: 'category' }),
  remove: (id: string) => request<{ ok: true }>(`/categories/${id}`, { method: 'DELETE' }),
};

export const goalsApi = {
  list: () => request<Goal[]>('/goals', { unwrap: 'goals' }),

  get: (id: string) => request<Goal>(`/goals/${id}`, { unwrap: 'goal' }),

  create: (body: { title: string; description?: string; targetDate?: string; categoryId?: string | null }) =>
    request<Goal>('/goals', { method: 'POST', body, unwrap: 'goal' }),

  update: (id: string, body: Partial<{ title: string; status: string; targetDate: string }>) =>
    request<Goal>(`/goals/${id}`, { method: 'PATCH', body, unwrap: 'goal' }),

  remove: (id: string) => request<{ ok: true }>(`/goals/${id}`, { method: 'DELETE' }),

  addMilestone: (goalId: string, body: { title: string; dueDate?: string; order?: number }) =>
    request<Milestone>(`/goals/${goalId}/milestones`, { method: 'POST', body, unwrap: 'milestone' }),

  toggleMilestone: (goalId: string, milestoneId: string, isDone: boolean) =>
    request<Milestone>(`/goals/${goalId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      body: { isDone },
      unwrap: 'milestone',
    }),

  /** Ownership is checked through the parent goal, so a foreign id 404s. */
  removeMilestone: (goalId: string, milestoneId: string) =>
    request<{ deleted: true }>(`/goals/${goalId}/milestones/${milestoneId}`, { method: 'DELETE' }),

  /** Clears the flag on every other goal in the same transaction. */
  setFeatured: (id: string, featured: boolean) =>
    request<Goal>(`/goals/${id}/featured`, { method: 'PATCH', body: { featured }, unwrap: 'goal' }),
};

export const statsApi = {
  overview: (query: { from: string; to: string }) => request<StatsOverview>('/stats/overview', { query }),
  categories: (query: { from: string; to: string }) =>
    request<CategoryStat[]>('/stats/categories', { query, unwrap: 'categories' }),
  streaks: () => request<StreakStats>('/stats/streaks'),
  daily: (query: { from: string; to: string }) =>
    request<DailyActivityPoint[]>('/stats/daily', { query, unwrap: 'days' }),
  /** Flat on `data`, and null when nothing has been written for the range. */
  coachInsight: () => request<CoachInsight | null>('/stats/coach-insight'),
  mood: (query: { from: string; to: string }) => request<MoodSeries>('/stats/mood', { query }),
};

export const searchApi = {
  query: (q: string, limit = 10) => request<SearchResults>('/search', { query: { q, limit } }),
};

export const calendarSyncApi = {
  feedUrl: () => request<{ url: string }>('/ical/feed-url'),
  rotate: () => request<{ url: string }>('/ical/rotate', { method: 'POST', body: {} }),

  listConnections: () =>
    request<CalendarConnection[]>('/calendar-connections', { unwrap: 'connections' }),

  connect: (body: { provider: CalendarProvider; url?: string; label?: string }) =>
    request<CalendarConnection>('/calendar-connections', {
      method: 'POST',
      body,
      unwrap: 'connection',
    }),

  disconnect: (id: string) =>
    request<{ ok: true }>(`/calendar-connections/${id}`, { method: 'DELETE' }),
};

export const tagsApi = {
  list: () => request<Tag[]>('/tags', { unwrap: 'tags' }),
  create: (body: { name: string; color?: string }) =>
    request<Tag>('/tags', { method: 'POST', body, unwrap: 'tag' }),
  update: (id: string, body: { name?: string; color?: string }) =>
    request<Tag>(`/tags/${id}`, { method: 'PATCH', body, unwrap: 'tag' }),
  remove: (id: string) => request<{ ok: true }>(`/tags/${id}`, { method: 'DELETE' }),
};

export const remindersApi = {
  /** Scoped by user, so another account's activity id returns an empty list. */
  list: (query: { activityId?: string; status?: 'PENDING' | 'SENT' } = {}) =>
    request<Reminder[]>('/reminders', { query, unwrap: 'reminders' }),
  create: (body: { activityId: string; remindAt: string; channel: 'EMAIL' | 'PUSH'; message?: string }) =>
    request<Reminder>('/reminders', { method: 'POST', body, unwrap: 'reminder' }),
  remove: (id: string) => request<{ ok: true }>(`/reminders/${id}`, { method: 'DELETE' }),
};

/** RRULE templates that generate activities on a schedule. */
export const recurringApi = {
  list: () => request<RecurringTemplate[]>('/recurring', { unwrap: 'recurring' }),
  create: (body: {
    title: string;
    rrule: string;
    startTime?: string;
    endTime?: string;
    categoryId?: string | null;
    isPrivate?: boolean;
  }) => request<RecurringTemplate>('/recurring', { method: 'POST', body, unwrap: 'recurring' }),
  update: (id: string, body: Partial<{ title: string; rrule: string; active: boolean }>) =>
    request<RecurringTemplate>(`/recurring/${id}`, { method: 'PATCH', body, unwrap: 'recurring' }),
  remove: (id: string) => request<{ ok: true }>(`/recurring/${id}`, { method: 'DELETE' }),
};
