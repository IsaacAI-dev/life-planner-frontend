import {
  BarChart3,
  Bell,
  CalendarDays,
  CalendarClock,
  CalendarSync,
  Crown,
  Flag,
  Home,
  MessagesSquare,
  PiggyBank,
  Settings,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PLAN_NAV: NavItem[] = [
  { href: '/today', label: 'Today', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/flexible', label: 'Flexible', icon: CalendarSync },
  { href: '/recurring', label: 'Repeating', icon: CalendarClock },
  { href: '/goals', label: 'Goals', icon: Flag },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
];

export const BOARD_NAV: NavItem[] = [
  { href: '/chats', label: 'Chats', icon: MessagesSquare },
  { href: '/shared-boards', label: 'Shared boards', icon: Users },
  { href: '/nutrition', label: 'Nutrition', icon: Utensils },
  { href: '/budget', label: 'Budget', icon: PiggyBank },
];

export const FOOTER_NAV: NavItem[] = [
  { href: '/plan', label: 'Plan', icon: Crown },
  { href: '/settings', label: 'Settings', icon: Settings },
];

/** The five destinations that fit the mobile tab bar. */
export const MOBILE_NAV: NavItem[] = [
  { href: '/today', label: 'Today', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/goals', label: 'Goals', icon: Flag },
  { href: '/chats', label: 'Chats', icon: MessagesSquare },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
];

export const PAGE_TITLES: Record<string, string> = {
  '/today': 'Today',
  '/calendar': 'Calendar',
  '/flexible': 'Flexible tasks',
  '/recurring': 'Repeating',
  '/goals': 'Goals',
  '/insights': 'Insights',
  '/chats': 'Chats',
  '/shared-boards': 'Shared boards',
  '/nutrition': 'Nutrition',
  '/budget': 'Budget',
  '/plan': 'Plan & billing',
  '/plan/seats': 'Seats',
  '/plan/transactions': 'Receipts',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export const NOTIFICATION_ICON = Bell;
