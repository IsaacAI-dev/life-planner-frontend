import { request } from '@/lib/api/client';
import type {
  BeneficiaryCheck,
  BillingInterval,
  PlanCatalog,
  Platform,
  RegionSettings,
  SeatInvitePreview,
  SeatsResponse,
  Subscription,
  Transaction,
} from '@/lib/types';

export const subscriptionApi = {
  /** The only endpoint the gating layer reads. Limits and usage arrive together. */
  current: () => request<Subscription>('/subscription', { unwrap: 'subscription' }),

  plans: (platform: Platform = 'WEB') =>
    request<PlanCatalog>('/subscription/plans', { query: { platform } }),

  setRegion: (body: { country: string; source?: 'APP_STORE' | 'PLAY_STORE' | 'WEB' }) =>
    request<RegionSettings>('/subscription/region', { method: 'PUT', body }),

  transactions: () => request<Transaction[]>('/subscription/transactions', { unwrap: 'transactions' }),

  /**
   * Checked before payment so we never take money we cannot honour: an address
   * already paying for Pro is refused, an unknown one is flagged for invitation.
   */
  validateBeneficiaries: (emails: string[]) =>
    request<BeneficiaryCheck[]>('/subscription/validate-beneficiaries', {
      method: 'POST',
      body: { emails },
      unwrap: 'beneficiaries',
    }),

  /** Entitlement is never granted here — only a verified webhook grants it. */
  checkout: (body: {
    tier: 'PRO';
    interval: BillingInterval;
    platform: Platform;
    seats?: number;
    beneficiaryEmails?: string[];
  }) => request<{ checkoutUrl: string }>('/subscription/checkout', { method: 'POST', body }),

  billingPortal: () =>
    request<{ portalUrl: string }>('/subscription/billing-portal', { method: 'POST', body: {} }),

  cancel: (immediate = false) =>
    request<Subscription>('/subscription/cancel', {
      method: 'POST',
      body: { immediate },
      unwrap: 'subscription',
    }),

  verifyPurchase: (body: { platform: 'IOS' | 'ANDROID'; productId: string; purchaseToken: string }) =>
    request<Subscription>('/subscription/verify-purchase', {
      method: 'POST',
      body,
      unwrap: 'subscription',
    }),
};

export const seatsApi = {
  list: () => request<SeatsResponse>('/subscription/seats'),

  invite: (emails: string[]) =>
    request<SeatsResponse>('/subscription/seats', { method: 'POST', body: { emails } }),

  /** An unclaimed invite is pulled at once; an active seat ends at period end. */
  remove: (seatId: string) =>
    request<{ ok: true }>(`/subscription/seats/${seatId}`, { method: 'DELETE' }),

  /** Singular, under /public, and flat — not `/seat-invites/:token`. */
  invitePreview: (token: string) =>
    request<SeatInvitePreview>(`/public/seat-invite/${token}`, { public: true }),

  claim: (token: string) =>
    request<{ ok: true }>('/subscription/seats/claim', { method: 'POST', body: { token } }),
};
