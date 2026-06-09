import { LayoutDashboard, Wallet, ArrowLeftRight, BarChart3, Settings } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { Href } from 'expo-router';

export interface NavTab {
  /** expo-router route name within the (tabs) group. */
  name: string;
  href: Href;
  icon: LucideIcon;
  label: string;
}

export const navTabs: NavTab[] = [
  { name: 'index', href: '/', icon: LayoutDashboard, label: 'Home' },
  { name: 'accounts', href: '/accounts', icon: Wallet, label: 'Accounts' },
  { name: 'transactions', href: '/transactions', icon: ArrowLeftRight, label: 'Txns' },
  { name: 'analytics', href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { name: 'settings', href: '/settings', icon: Settings, label: 'Settings' },
];
