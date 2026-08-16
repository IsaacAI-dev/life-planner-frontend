/** Shapes returned by user-api (/api/v1), current as of Addendum 3 + family plans. */

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type Gender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'UNDISCLOSED';

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  country: string | null;
  status: UserStatus;
  statusReason: string | null;
  createdAt: string;
  avatarUrl: string | null;
  avatarPresetKey: string | null;
}

/** Returned under `data.user`: account fields and profile fields together. */
export interface UserProfile extends User {
  phone: string | null;
  location: string | null;
  state: string | null;
  heightCm: number | null;
  yearOfBirth: number | null;
  gender: Gender | null;
  regionSource: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  /** null on flexible tasks. */
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  isDone: boolean;
  completedAt: string | null;
  isPrivate: boolean;
  order: number;
  categoryId: string | null;
  category: Category | null;
  goalId: string | null;
  tags: Tag[];
  windowStart: string | null;
  windowEnd: string | null;
  targetCount: number;
  completedCount: number;
}

export interface ActivitySession {
  id: string;
  activityId: string;
  startedAt: string;
  endedAt: string | null;
  /** Only returned by the stop call, for the session it just closed. */
  durationMinutes?: number;
}

export interface ActivitySessions {
  sessions: ActivitySession[];
  /** The open session, or null. Authoritative — do not scan for endedAt. */
  running: ActivitySession | null;
  actualMinutes: number;
  plannedMinutes: number | null;
}

export interface CalendarDay {
  date: string;
  activities: Activity[];
  note: DayNote | null;
  /**
   * Read-only overlay from a connected calendar — never an Activity row. Not
   * editable, no quota, no streak effect. Owner-only: a shared board returns an
   * empty list even with a FULL grant.
   */
  importedEvents: ImportedEvent[];
}

export interface ImportedEvent {
  id: string;
  title: string;
  /** Clock times within the day, e.g. "09:30". Null when allDay. */
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  location: string | null;
  /** The connection's label, falling back to the provider name. */
  source: string;
}

export interface CalendarRange {
  days: CalendarDay[];
  flexibleTasks: Activity[];
}

export interface DayNote {
  id: string;
  date: string;
  content: string;
  mood: number | null;
}

export type GoalStatus = 'ACTIVE' | 'ACHIEVED' | 'ARCHIVED';

export interface Milestone {
  id: string;
  title: string;
  dueDate: string | null;
  isDone: boolean;
  order: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: GoalStatus;
  categoryId: string | null;
  category: Category | null;
  milestones: Milestone[];
  featured: boolean;
}

export interface StatsOverview {
  plannedMinutes: number;
  completedMinutes: number;
  totalActivities: number;
  completedActivities: number;
  completionRate: number;
  notesWritten: number;
  daysInRange: number;
}

export interface CategoryStat {
  /** "uncategorized" is a synthetic row, not a real id — never link it. */
  categoryId: string;
  name: string;
  color: string;
  /** Activity counts, not minutes. */
  total: number;
  done: number;
}

export interface StreakStats {
  current: number;
  longest: number;
  lastCompletedDate: string | null;
}

export interface DailyActivityPoint {
  date: string;
  totalMinutes: number;
  byCategory: { categoryId: string | null; name: string; color: string; minutes: number }[];
}

export interface MoodPoint {
  date: string;
  mood: number;
}

/** Sparse — only days with a logged mood appear, unlike /stats/daily. */
export interface MoodSeries {
  range: { from: string; to: string };
  average: number | null;
  points: MoodPoint[];
}

export interface Reminder {
  id: string;
  activityId: string;
  remindAt: string;
  channel: 'EMAIL' | 'PUSH';
  message: string | null;
  sentAt: string | null;
}

export interface RecurringTemplate {
  id: string;
  title: string;
  rrule: string;
  startTime: string | null;
  endTime: string | null;
  active: boolean;
  categoryId: string | null;
  category: Category | null;
  isPrivate: boolean;
}

export type ActivityChangeType =
  | 'CREATED'
  | 'UPDATED'
  | 'TOGGLED'
  | 'DELETED'
  | 'DELETED_BY_ADMIN';

export interface ActivityHistoryEntry {
  id: string;
  activityId: string;
  changeType: ActivityChangeType;
  snapshot: Record<string, unknown> | null;
  /** Null for user-initiated changes. */
  adminId: string | null;
  createdAt: string;
}

export interface CoachInsight {
  id: string;
  headline: string;
  body: string;
  periodStart: string;
  periodEnd: string;
  author: AdminSummary | null;
  createdAt: string;
}

export interface AdminSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/* --- Chat ------------------------------------------------------------- */

export type ConversationType = 'LIFE_COACH' | 'FITNESS' | 'SUPPORT';
export type ConversationStatus = 'OPEN' | 'CLAIMED' | 'CLOSED';
export type MessageKind = 'TEXT' | 'VOICE_NOTE' | 'RECOMMENDATION' | 'FEEDBACK_FORM' | 'SYSTEM';

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string | null;
  status: ConversationStatus;
  /** True when the tier does not include this conversation type. */
  locked: boolean;
  updatedAt: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  assignedAdmin: AdminSummary | null;
}

export interface ConversationDetail extends Conversation {
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  kind: MessageKind;
  content: string;
  senderType: 'USER' | 'ADMIN';
  senderName: string | null;
  createdAt: string;
  readAt: string | null;
  editedAt: string | null;
  editCount: number;
  deletedAt: string | null;
  replyTo: QuotedMessage | null;
  reactions: MessageReaction[];
  attachment: MessageAttachment | null;
  recommendation: Recommendation | null;
  feedbackForm: FeedbackForm | null;
}

/**
 * A quoted parent. `content` is nulled server-side when the message is deleted,
 * so a tombstone renders even if `deleted` is misread.
 */
export interface QuotedMessage {
  id: string;
  senderType: 'USER' | 'ADMIN' | 'SYSTEM';
  kind: MessageKind;
  senderName: string | null;
  content: string | null;
  deleted: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface MessageAttachment {
  id: string;
  kind: 'VOICE_NOTE' | 'IMAGE';
  url: string;
  mimeType: string;
  durationSeconds: number;
  waveform: number[];
}

export type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'DISMISSED';

export interface Recommendation {
  id: string;
  kind: 'ACTIVITY' | 'GOAL';
  status: RecommendationStatus;
  respondedAt: string | null;
  /** Title, date and times live in here, not at the top level. */
  payload: {
    title: string;
    description?: string | null;
    date?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  };
  createdEntityId: string | null;
}

export type FeedbackFormStatus = 'SENT' | 'COMPLETED' | 'EXPIRED';

export interface FeedbackForm {
  id: string;
  status: FeedbackFormStatus;
  periodStart: string;
  periodEnd: string;
  platformRating: number | null;
  lifeCoachRating: number | null;
  fitnessRating: number | null;
  supportRating: number | null;
  comment: string | null;
  expiresAt: string;
  respondedAt: string | null;
}

export interface ChatUnread {
  total: number;
  byConversation: { conversationId: string; unreadCount: number }[];
}

/* --- Settings --------------------------------------------------------- */

export type TextScale = 'SMALL' | 'DEFAULT' | 'LARGE' | 'LARGEST';
export type CoachCheckInFrequency = 'OFF' | 'DAILY' | 'WEEKLY';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  weekStartsOn: 0 | 1;
  defaultCalendarView: 'week' | 'month';
  excludeWeekendsByDefault: boolean;
  timezone: string;
  defaultCategoryId: string | null;
  textScale: TextScale;
  coachCheckInFrequency: CoachCheckInFrequency;
  notifications: {
    email: boolean;
    push: boolean;
    dailyReminderTime: string | null;
  };
}

/* --- Board sharing ---------------------------------------------------- */

export type BoardPermission = 'PUBLIC_ONLY' | 'FULL';
export type BoardShareStatus = 'ACTIVE' | 'REVOKED';

export interface BoardShare {
  id: string;
  permission: BoardPermission;
  status: BoardShareStatus;
  createdAt: string;
  owner: BoardShareParty;
  viewer: BoardShareParty;
}

export interface BoardShareParty {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

/* --- Nutrition -------------------------------------------------------- */

export interface FoodCategoryTag {
  key: string;
  label: string;
  color: string | null;
}

/** Preview of what switching country would destroy, before anything is applied. */
export interface CountryChangePreview {
  from: { country: string | null; currency: string | null; name: string | null };
  to: { country: string; currency: string; name: string };
  currentCurrency: string | null;
  nextCurrency: string;
  selectedMealsRemoved: number;
  /**
   * Server-authored, already pluralised and naming real counts and currencies.
   * Rendered verbatim: an empty array means genuinely nothing will be lost,
   * which a mis-read field name cannot fake.
   */
  warnings: string[];
  consequences: {
    selectedMealsRemoved: number;
    foodsAvailableInNewCountry: number;
    currencyChanges: boolean;
    budgetsRedenominated: boolean;
  };
  /** False on first-time setup — there is nothing yet to lose. */
  requiresConfirmation: boolean;
}

export interface FoodItem {
  id: string;
  country: string;
  name: string;
  /** A food belongs to several categories now, not one. */
  categories: FoodCategoryTag[];
  caloriesPerServing: number;
  servingSize: string | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  imageUrl: string | null;
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealItem {
  id: string;
  mealId: string;
  foodItemId: string | null;
  foodItem: FoodItem | null;
  freeText: string | null;
  servings: number | null;
  weightGrams: number | null;
  order: number;
}

export interface Meal {
  id: string;
  mealType: MealType;
  mealTime: string | null;
  /** Computed from the items. `estimatedCalories` is the coach's own figure. */
  calories: number | null;
  estimatedCalories: number | null;
  order: number;
  items: MealItem[];
}

export interface MealPlan {
  id: string;
  date: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  targetCalories: number | null;
  notes: string | null;
  meals: Meal[];
  createdByAdmin: AdminSummary | null;
}

export type MealRequestStatus = 'PENDING' | 'FULFILLED' | 'DECLINED';

export interface MealRequest {
  id: string;
  date: string;
  note: string | null;
  status: MealRequestStatus;
  requestedAt: string;
}

/* --- Budget ----------------------------------------------------------- */

export type BudgetCategory = 'MANDATORY' | 'SECONDARY' | 'OPTIONAL';
export type IncomeStatus = 'PROJECTED' | 'ARRIVED' | 'DEFERRED' | 'CANCELLED';
export type ExpenseStatus = 'COMMITTED' | 'PAID';

export interface BudgetIncome {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  amount: number;
  status: IncomeStatus;
  expectedDate: string | null;
  receivedAt: string | null;
  /** True when this row slipped in from an earlier month. */
  rolledOver: boolean;
  rolledFromId: string | null;
  recurring: boolean;
}

export interface BudgetExpense {
  id: string;
  title: string;
  amount: number;
  category: BudgetCategory;
  status: ExpenseStatus;
  date: string | null;
  paidAt: string | null;
  notes: string | null;
}

export interface BudgetTotals {
  arrivedIncome: number;
  projectedIncome: number;
  totalIncome: number;
  deferredIncome: number;
  totalExpenses: number;
  paidExpenses: number;
  outstandingExpenses: number;
  /** Arrived income minus paid expenses — what is actually in hand. */
  availableNow: number;
  /** All income minus all expenses — where the month lands if everything turns up. */
  projectedBalance: number;
}

export interface BudgetCategoryTotal {
  category: BudgetCategory;
  color: string;
  total: number;
  paid: number;
}

export interface RecentBudgetMonth {
  year: number;
  month: number;
  /** Counted apart from `incomes`: only recurring rows are worth copying forward. */
  recurringIncomes: number;
  incomes: number;
  expenses: number;
  hasData: boolean;
}

export interface BudgetCounts {
  incomes: number;
  awaiting: number;
  expenses: number;
  unpaid: number;
}

export interface BudgetLedger {
  year: number;
  month: number;
  /** False on a month nobody has touched — the empty state, not an error. */
  started: boolean;
  /** Single currency per person, resolved from their country. */
  currency: string;
  notes: string | null;
  incomes: BudgetIncome[];
  expenses: BudgetExpense[];
  totals: BudgetTotals;
  byCategory: BudgetCategoryTotal[];
  counts: BudgetCounts;
}

/* --- Subscription, billing and seats ---------------------------------- */

export type PlanTier = 'FREE' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type BillingInterval = 'MONTHLY' | 'QUARTERLY';
export type Platform = 'WEB' | 'IOS' | 'ANDROID';
export type PaymentProvider = 'PAYSTACK' | 'PADDLE' | 'APP_STORE' | 'PLAY_STORE';
/** How the caller has Pro: bought it, or was given a seat by someone else. */
export type EntitlementSource = 'OWN' | 'SEAT';

export interface PlanLimits {
  activitiesPerWeek: number | null;
  goals: number | null;
  chatEnabled: boolean;
  voiceNotesEnabled: boolean;
  mealPlansEnabled: boolean;
  /** Support is never paywalled. */
  supportChatEnabled: boolean;
}

export interface PlanUsage {
  activitiesThisWeek: number;
  goals: number;
}

export interface Subscription {
  tier: PlanTier;
  status: SubscriptionStatus;
  interval: BillingInterval | null;
  /** Every billing field is null for a seat holder. */
  currency: string | null;
  amount: number | null;
  seatCount: number;
  source: EntitlementSource;
  /** Set when `source` is SEAT — who is paying, and until when. */
  seat: {
    providerName: string;
    providerEmail: string;
    seatId: string;
    /** Set only when the seat is revoked with a period still to run. */
    endsAt: string | null;
  } | null;
  renewsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  provider: PaymentProvider | null;
  platform: Platform | null;
  limits: PlanLimits;
  usage: PlanUsage;
}

export interface PlanOption {
  tier: PlanTier;
  name: string;
  description: string | null;
  /** Copy explaining that a seat grants access, never visibility. */
  privacyNote: string | null;
  interval: BillingInterval;
  seats: number;
  currency: string;
  amount: number;
  features: string[];
  highlight: boolean;
  /** amount ÷ seats, for "₦2,250 each". Absent on /public/plans. */
  perSeatAmount?: number;
  savingPercent?: number;
  savingVersusSolo?: number;
  /** Store product id; null on WEB. */
  productId: string | null;
}

export interface PlanCatalog {
  provider: PaymentProvider;
  /** ISO code, or null when the region could not be resolved. */
  region: string | null;
  /** Display name on the public route, ISO code on the signed-in one. */
  country: string;
  currency: string;
  /** The seat ceiling to render, so the selector is not hardcoded. */
  maxSeats: number;
  plans: PlanOption[];
}

/** How the visitor's region was determined — drives whether we assert or offer. */
export type RegionResolution = 'QUERY' | 'EDGE' | 'FALLBACK';

/** Same shape as the signed-in catalog, plus how the region was resolved. */
export interface PublicPlanCatalog extends PlanCatalog {
  resolvedFrom: RegionResolution;
}

export interface RegionSettings {
  country: string;
  currency: string;
  webProvider: PaymentProvider;
}

export interface Transaction {
  id: string;
  type: string;
  status: 'PAID' | 'REFUNDED' | 'FAILED';
  provider: PaymentProvider;
  currency: string;
  grossAmount: number;
  netAmount: number;
  taxAmount: number;
  description: string | null;
  occurredAt: string;
  /** Provider's own reference. Often null; there is no hosted invoice URL. */
  providerInvoiceId: string | null;
}

/** One row per email checked before checkout. */
export interface BeneficiaryCheck {
  email: string;
  ok: boolean;
  /** True when there is no account yet — they will be emailed an invitation. */
  willBeInvited: boolean;
  message: string | null;
}

export type SeatStatus = 'ACTIVE' | 'INVITED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';

export interface Seat {
  id: string;
  email: string;
  name: string | null;
  status: SeatStatus;
  invitedAt: string;
  claimedAt: string | null;
  endsAt: string | null;
}

export interface SeatsResponse {
  seatCount: number;
  pendingSeatCount: number;
  used: number;
  available: number;
  seats: Seat[];
  /** Invitations that lapsed or were declined, so a freed seat is explicable. */
  history: Seat[];
}

/**
 * Deliberately narrow: the invitee learns who is paying and what that does not
 * grant. The plan's name and price are the payer's business.
 */
export interface SeatInvitePreview {
  invitedBy: string;
  email: string;
  expiresAt: string;
  /** Server-authored reassurance; rendered verbatim. */
  privacyNote: string;
}

/* --- Notifications, search, calendar import --------------------------- */

export interface Notification {
  id: string;
  userId: string;
  type: string;
  metadata: Record<string, unknown> | null;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface SearchResults {
  query: string;
  activities: SearchActivity[];
  goals: { id: string; title: string; status: GoalStatus; featured: boolean }[];
  notes: DayNote[];
  totals: { activities: number; goals: number; notes: number };
}

export interface SearchActivity {
  id: string;
  title: string;
  date: string | null;
  startTime: string | null;
  isDone: boolean;
  isPrivate: boolean;
  category: Category | null;
}

export type CalendarProvider = 'GOOGLE' | 'APPLE' | 'OUTLOOK' | 'ICS';

export interface CalendarConnection {
  id: string;
  provider: CalendarProvider;
  label: string;
  lastSyncedAt: string | null;
  syncEnabled: boolean;
}

/* --- Public (unauthenticated) ----------------------------------------- */

export interface AvatarPreset {
  id: string;
  key: string;
  label: string;
  url: string;
  category: string | null;
}

export interface StaffMember {
  id: string;
  name: string;
  /** API field name — not `position`. */
  staffRole: string;
  bio: string | null;
  /** API field name — not `imageUrl`. */
  photoUrl: string | null;
  favQuote: string | null;
  linkedIn: string | null;
}

/** Endpoint: GET /public/about — dynamic About page content + team. */
export interface PublicAbout {
  headline: string;
  body: string;
  staff: StaffMember[];
}

/** All fields sit at the top level of `data`, not nested under `content`. */
export interface PublicContent {
  hero: { headline: string; subhead: string; ctaLabel: string };
  /** Always arrays, never null — safe to map without guarding. */
  features: { title: string; body: string; icon: string | null }[];
  faqs: { question: string; answer: string }[];
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
    supportEmail: string | null;
  } | null;
  about: { headline: string | null; body: string | null; staff: StaffMember[] } | null;
  socialLinks: Record<string, string> | null;
  updatedAt: string;
}

export type SecurityTokenType = 'SIGNUP' | 'PASSWORD_RESET' | 'SEAT_INVITE';

export interface SecurityTokenPreview {
  type: SecurityTokenType;
  email: string;
  /** A ready-made sentence that already names whoever triggered this. */
  summary: string;
  /** True only for SEAT_INVITE: declining an invitation is not an accusation. */
  canReject: boolean;
  expiresAt: string;
}

export interface SecurityActionResult {
  type: SecurityTokenType;
  outcome: 'REJECTED' | 'REPORTED';
  consequences: string[];
  message: string;
}

/* --- Proposed: marketing site (see MARKETING_ENDPOINTS.md) ------------ */

/**
 * One call for every image slot on the marketing site. Each field is
 * nullable — a missing asset falls back to the labelled ImageSlot
 * placeholder rather than a broken image.
 */
export interface MarketingAssets {
  heroPreviewUrl: string | null;
  screens: { key: string; imageUrl: string | null }[];
  bendPrimaryUrl: string | null;
  bendDetailUrl: string | null;
  testimonialPortraits: { name: string; imageUrl: string | null }[];
  aboutHeroUrl: string | null;
  teamPortraits: { name: string; imageUrl: string | null }[];
}

export interface PublicFaq {
  question: string;
  answer: string;
}

/** Office address is shown only when present — some regions have none to publish. */
export interface PublicContactInfo {
  email: string;
  supportHours: string | null;
  officeAddress: string | null;
}

export interface CareerRole {
  id: string;
  slug: string;
  title: string;
  department: string;
  body: string;
  location: string;
  employmentType: string;
  compensation: string | null;
  applyUrl: string | null;
}

export interface StoreLink {
  url: string;
  badgeImageUrl: string;
}

export interface AppLinks {
  appStore: StoreLink | null;
  playStore: StoreLink | null;
}

/**
 * A published legal page from the backend. Sections use the same shape
 * as the hardcoded LegalPage component so the two sources are interchangeable.
 * Returned by GET /public/terms and GET /public/privacy.
 */
export interface PublicLegalPage {
  id: string;
  slug: string;
  version: string;
  title: string;
  /** Plain string — not a React node. */
  intro: string;
  sections: { h: string; p: string | string[] }[];
  publishedAt: string;
  updatedAt: string;
}

/** Powers the sign-up consent checkbox. Full text stays on /terms and /privacy. */
export interface LegalConsent {
  version: string;
  updatedAt: string;
  summary: string;
}

export interface ContactSubmissionResult {
  id: string;
  receivedAt: string;
}
