import type { BudgetCategory, ConversationType, MealType, TextScale } from '@/lib/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

export const CONVERSATION_LABELS: Record<ConversationType, string> = {
  LIFE_COACH: 'Life Coach',
  FITNESS: 'Fitness Assistant',
  SUPPORT: 'Support',
};

export const QUICK_REACTIONS = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F389}', '\u{1F525}', '\u{1F64F}'];

export const STORAGE_KEYS = {
  accessToken: 'lp.accessToken',
  refreshToken: 'lp.refreshToken',
  theme: 'lp.theme',
  textScale: 'lp.textScale',
  sessionId: 'lp.sessionId',
} as const;

/** Mirrors BUDGET_CATEGORY_COLORS in the backend's shared-utils package. */
export const BUDGET_CATEGORY_COLORS: Record<BudgetCategory, string> = {
  MANDATORY: '#DC2626',
  SECONDARY: '#D97706',
  OPTIONAL: '#0891B2',
};

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  MANDATORY: 'Mandatory',
  SECONDARY: 'Secondary',
  OPTIONAL: 'Optional',
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

export const TEXT_SCALE_VALUES: Record<TextScale, number> = {
  SMALL: 0.9,
  DEFAULT: 1,
  LARGE: 1.12,
  LARGEST: 1.25,
};

export const TEXT_SCALE_ORDER: TextScale[] = ['SMALL', 'DEFAULT', 'LARGE', 'LARGEST'];

/** Fallback palette for activities whose category has no colour set. */
export const FALLBACK_CATEGORY_COLOR = '#A78BFA';

export const MOOD_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Flat',
  3: 'Steady',
  4: 'Bright',
  5: 'Soaring',
};
