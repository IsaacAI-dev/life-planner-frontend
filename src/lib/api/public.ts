import { request, requestOptional } from '@/lib/api/client';
import type {
  AppLinks,
  AvatarPreset,
  CareerRole,
  ContactSubmissionResult,
  LegalConsent,
  MarketingAssets,
  PublicAbout,
  PublicContactInfo,
  PublicContent,
  PublicFaq,
  PublicLegalPage,
  PublicPlanCatalog,
  SecurityActionResult,
  SecurityTokenPreview,
} from '@/lib/types';

/**
 * Unauthenticated by design. Whoever follows a security link may have no
 * account, and requiring a login to disown an action you never took would be
 * absurd — the one-time token is the credential.
 */
export const publicApi = {
  /** hero, features and faqs sit at the top level of `data`. */
  content: () => request<PublicContent>('/public/content', { public: true }),

  /**
   * Region-aware. Pass a two-letter ISO code once the visitor picks one; it
   * takes precedence over the edge header and comes back as resolvedFrom QUERY.
   */
  plans: (country?: string) =>
    request<PublicPlanCatalog>('/public/plans', { query: { country }, public: true }),

  avatarPresets: () =>
    request<AvatarPreset[]>('/public/avatar-presets', { public: true, unwrap: 'presets' }),

  securityToken: (token: string) =>
    request<SecurityTokenPreview>(`/public/security/${token}`, { public: true }),

  /** REJECT declines an invitation and files nothing; REPORT raises abuse. */
  actOnSecurityToken: (token: string, body: { action: 'REJECT' | 'REPORT'; note?: string }) =>
    request<SecurityActionResult>(`/public/security/${token}`, {
      method: 'POST',
      body,
      public: true,
    }),

  /* ---- Proposed — see MARKETING_ENDPOINTS.md. All degrade to a static
     fallback in the calling component when unavailable, except careers
     roles and the contact form, which are genuinely dynamic and have no
     honest static fallback. ---- */

  marketingAssets: () =>
    requestOptional<MarketingAssets>('/public/marketing-assets', { public: true }),

  faqs: () => requestOptional<PublicFaq[]>('/public/faqs', { public: true, unwrap: 'faqs' }),

  contactInfo: () => requestOptional<PublicContactInfo>('/public/contact', { public: true }),

  careerRoles: () =>
    requestOptional<CareerRole[]>('/public/careers/roles', { public: true, unwrap: 'roles' }),

  appLinks: () => requestOptional<AppLinks>('/public/app-links', { public: true }),

  legalConsent: () => requestOptional<LegalConsent>('/public/legal/consent', { public: true }),

  submitContact: (body: { name: string; email: string; topic: string; message: string }) =>
    requestOptional<ContactSubmissionResult>('/public/contact-submissions', {
      method: 'POST',
      body,
      public: true,
    }),

  /**
   * Dynamic About page content. `headline` and `body` replace the page's
   * static copy when present; `staff` replaces the hardcoded team list.
   * Falls back to the handoff static content on any network error.
   */
  about: () => requestOptional<PublicAbout>('/public/about', { public: true }),

  /**
   * Current Terms & Conditions. 404 when nothing is published — the page
   * falls back to the handoff's verbatim static copy in that case.
   */
  terms: () => requestOptional<PublicLegalPage>('/public/terms', { public: true }),

  /**
   * Current Privacy Policy. Same shape and same 404-fallback pattern as
   * /public/terms.
   */
  privacy: () => requestOptional<PublicLegalPage>('/public/privacy', { public: true }),
};
