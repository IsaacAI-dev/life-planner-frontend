import { API_URL, STORAGE_KEYS } from '@/lib/constants';
import type { ApiResponse } from '@/lib/types';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** 402 with `details.upgradeRequired` — the caller should offer the upgrade. */
  get upgradeRequired(): boolean {
    return this.status === 402 && this.details?.upgradeRequired === true;
  }
}

export const tokenStore = {
  access: (): string | null =>
    typeof window === 'undefined' ? null : localStorage.getItem(STORAGE_KEYS.accessToken),
  refresh: (): string | null =>
    typeof window === 'undefined' ? null : localStorage.getItem(STORAGE_KEYS.refreshToken),
  save(accessToken: string, refreshToken: string) {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    // Mirrored as a cookie so middleware can redirect before the app boots.
    document.cookie = 'lp_auth=1; path=/; max-age=2592000; SameSite=Lax';
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    document.cookie = 'lp_auth=; path=/; max-age=0; SameSite=Lax';
  },
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /**
   * The API nests each resource under a named key — `data.activity`,
   * `data.tokens`, `data.items`. Naming it here keeps that detail out of
   * every call site.
   */
  unwrap?: string;
  /** Skips the Authorization header and the refresh retry. */
  public?: boolean;
}

/**
 * Pulls the resource out of the keyed envelope. Falls back to the sole property
 * when the key differs from the one expected, and to the payload itself when it
 * is not wrapped at all, so a naming difference degrades instead of throwing.
 */
function extract<T>(payload: unknown, key?: string): T {
  if (!key || payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload as T;
  }

  const record = payload as Record<string, unknown>;
  if (key in record) return record[key] as T;

  const keys = Object.keys(record);
  if (keys.length === 1) return record[keys[0]] as T;

  return payload as T;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(API_URL + path);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

let refreshInFlight: Promise<boolean> | null = null;

/** Exchanges the refresh token for a new pair. Concurrent 401s share one attempt. */
async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = tokenStore.refresh();
    if (!refreshToken) return false;

    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = (await response.json().catch(() => null)) as ApiResponse<{
      tokens: { accessToken: string; refreshToken: string };
    }> | null;

    if (!response.ok || !payload?.success) {
      tokenStore.clear();
      return false;
    }

    const { accessToken, refreshToken: nextRefresh } = payload.data.tokens;
    tokenStore.save(accessToken, nextRefresh);
    return true;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function send<T>(path: string, options: RequestOptions, retry: boolean): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const accessToken = tokenStore.access();

  if (!options.public && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401 && retry && !options.public) {
    const refreshed = await refreshSession();
    if (refreshed) return send<T>(path, options, false);
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

  if (!payload) {
    throw new ApiError('NETWORK_ERROR', 'The server sent an unreadable response.', response.status);
  }

  if (!payload.success) {
    throw new ApiError(
      payload.error.code,
      payload.error.message,
      response.status,
      payload.error.details as Record<string, unknown> | undefined,
    );
  }

  return extract<T>(payload.data, options.unwrap);
}

export function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return send<T>(path, options, true);
}

/**
 * For endpoints that may not be deployed yet. Resolves to null on 404/405/501
 * so a screen can fall back instead of failing.
 */
export async function requestOptional<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T | null> {
  try {
    return await request<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && [404, 405, 501].includes(error.status)) return null;
    throw error;
  }
}
