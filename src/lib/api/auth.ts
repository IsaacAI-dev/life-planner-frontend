import { request } from '@/lib/api/client';
import type {
  AuthSession,
  CountryChangePreview,
  Gender,
  User,
  UserProfile,
} from '@/lib/types';

export const authApi = {
  login: (body: { email: string; password: string }) =>
    request<AuthSession>('/auth/login', { method: 'POST', body, public: true }),

  register: (body: { email: string; password: string; name: string; timezone: string }) =>
    request<AuthSession>('/auth/register', { method: 'POST', body, public: true }),

  logout: (refreshToken: string) =>
    request<{ ok: true }>('/auth/logout', { method: 'POST', body: { refreshToken } }),

  me: () => request<User>('/auth/me', { unwrap: 'user' }),

  updateAccount: (body: Partial<Pick<User, 'name' | 'timezone' | 'country'>>) =>
    request<User>('/auth/me', { method: 'PATCH', body, unwrap: 'user' }),

  /** Returns a full user object, not a separate profile record. */
  getProfile: () => request<UserProfile>('/auth/me/profile', { unwrap: 'user' }),

  updateProfile: (body: {
    phone?: string | null;
    location?: string | null;
    state?: string | null;
    heightCm?: number | null;
    yearOfBirth?: number | null;
    gender?: Gender | null;
  }) => request<UserProfile>('/auth/me/profile', { method: 'PATCH', body, unwrap: 'user' }),

  /** Step one of a destructive change: what would be lost, in numbers. */
  countryChangePreview: (country: string) =>
    request<CountryChangePreview>('/auth/me/profile/country/change-preview', {
      query: { country },
    }),

  /**
   * Refused with 400 unless `confirm` is true. Clears selected foods and
   * switches currency. Historic budget amounts are not rewritten — only the
   * symbol changes.
   */
  changeCountry: (country: string, confirm: boolean) =>
    request<User>('/auth/me/profile/country', {
      method: 'PUT',
      body: { country, confirm },
      unwrap: 'user',
    }),

  uploadAvatar: (body: { imageBase64: string; mimeType: string }) =>
    request<User>('/auth/me/profile/avatar', { method: 'POST', body, unwrap: 'user' }),

  /** Choosing a preset clears an uploaded photo, and vice versa. */
  selectAvatarPreset: (presetKey: string) =>
    request<User>('/auth/me/profile/avatar/preset', {
      method: 'PUT',
      body: { presetKey },
      unwrap: 'user',
    }),

  removeAvatar: () =>
    request<User>('/auth/me/profile/avatar', { method: 'DELETE', unwrap: 'user' }),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ ok: true }>('/auth/change-password', { method: 'POST', body }),

  forgotPassword: (email: string) =>
    request<{ ok: true }>('/auth/forgot-password', { method: 'POST', body: { email }, public: true }),

  resetPassword: (body: { token: string; password: string }) =>
    request<{ ok: true }>('/auth/reset-password', { method: 'POST', body, public: true }),
};
