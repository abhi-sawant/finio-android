import { memo } from 'react';
import {
  Trash2,
  Landmark,
  PiggyBank,
  Banknote,
  CreditCard,
  TrendingUp,
  Wallet,
  Coins,
  Building2,
  Briefcase,
  Home,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { formatCurrency } from '@/utils/formatters';
import { useCurrency } from '@/store/useFinanceStore';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { Account } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  'piggy-bank': PiggyBank,
  banknote: Banknote,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
  wallet: Wallet,
  coins: Coins,
  'building-2': Building2,
  briefcase: Briefcase,
  home: Home,
};

export const accountIconNames = Object.keys(ICON_MAP);

export function AccountIcon({
  icon,
  size = 16,
  color,
}: {
  icon: string;
  size?: number;
  color?: string;
}) {
  const Icon = ICON_MAP[icon];
  if (Icon) return <Icon size={size} color={color} />;
  return <Text style={{ fontSize: size, color }}>{icon}</Text>;
}

interface AccountCardProps {
  account: Account;
  variant?: 'horizontal' | 'grid';
  onPress?: () => void;
  onDelete?: () => void;
}

export const AccountCard = memo(function AccountCard({
  account,
  variant = 'horizontal',
  onPress,
  onDelete,
}: AccountCardProps) {
  const currency = useCurrency();
  const colors = useThemeColors();

  const isCredit = account.type === 'credit';
  const utilization =
    isCredit && account.creditLimit
      ? Math.abs(Math.min(account.balance, 0)) / account.creditLimit
      : 0;

  const negative = account.balance < 0;

  return (
    <Pressable
      onPress={onPress}
      className="relative overflow-hidden rounded-2xl border border-border p-4 active:scale-[0.98]"
      style={{
        backgroundColor: account.color + '14',
        minWidth: variant === 'horizontal' ? 180 : undefined,
      }}>
      {onDelete ? (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.destructive + '1a' }}>
          <Trash2 size={13} color={colors.destructive} />
        </Pressable>
      ) : null}

      <View className="mb-2 flex-row items-center gap-2">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: account.color }}>
          <AccountIcon icon={account.icon} size={16} color="#fff" />
        </View>
        <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {account.type}
        </Text>
      </View>

      <Text numberOfLines={1} className="text-sm font-medium text-foreground">
        {account.name}
      </Text>
      <Text
        className="mt-0.5 text-base font-bold"
        style={{ color: negative ? '#f43f5e' : colors.foreground }}>
        {formatCurrency(account.balance, currency, true)}
      </Text>

      {isCredit && account.creditLimit ? (
        <View className="mt-2">
          <View className="h-1.5 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(utilization * 100, 100)}%`,
                backgroundColor:
                  utilization > 0.8 ? '#ef4444' : utilization > 0.5 ? '#f59e0b' : '#22c55e',
              }}
            />
          </View>
          <Text className="mt-1 text-[10px] text-muted-foreground">
            {Math.round(utilization * 100)}% used
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
});
