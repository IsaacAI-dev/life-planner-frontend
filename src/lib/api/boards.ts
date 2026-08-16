import { request } from '@/lib/api/client';
import type { BoardPermission, BoardShare, CalendarRange } from '@/lib/types';

export const boardsApi = {
  list: (direction: 'granted' | 'received', status?: 'ACTIVE' | 'REVOKED') =>
    request<BoardShare[]>('/board-shares', { query: { direction, status }, unwrap: 'boardShares' }),

  grant: (body: { viewerEmail: string; permission: BoardPermission }) =>
    request<BoardShare>('/board-shares', { method: 'POST', body, unwrap: 'boardShare' }),

  updatePermission: (id: string, permission: BoardPermission) =>
    request<BoardShare>(`/board-shares/${id}`, {
      method: 'PATCH',
      body: { permission },
      unwrap: 'boardShare',
    }),

  revoke: (id: string) => request<{ ok: true }>(`/board-shares/${id}`, { method: 'DELETE' }),

  viewBoard: (userId: string, query: { from: string; to: string }) =>
    request<CalendarRange>(`/users/${userId}/board`, { query }),
};
