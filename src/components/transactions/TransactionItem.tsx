import { memo } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Repeat } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { formatCurrency, formatTime } from '@/utils/formatters';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { Transaction, Category, Account, Currency } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  categories: Category[];
  accounts: Account[];
  currency: Currency;
  onPress?: () => void;
}

export const TransactionItem = memo(function TransactionItem({
  transaction,
  categories,
  accounts,
  currency,
  onPress,
}: TransactionItemProps) {
  const colors = useThemeColors();
  const category = categories.find((c) => c.id === transaction.categoryId);
  const account = accounts.find((a) => a.id === transaction.accountId);
  const toAccount = transaction.toAccountId
    ? accounts.find((a) => a.id === transaction.toAccountId)
    : undefined;

  const TypeIcon =
    transaction.type === 'income'
      ? ArrowDownLeft
      : transaction.type === 'expense'
        ? ArrowUpRight
        : ArrowLeftRight;

  const amountColor =
    transaction.type === 'income'
      ? '#10b981'
      : transaction.type === 'expense'
        ? '#f43f5e'
        : '#0ea5e9';

  const amountPrefix =
    transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '';

  const tint = category?.color ?? '#94a3b8';

  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3 active:scale-[0.98]">
      <View
        className="h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: tint + '20' }}>
        <TypeIcon size={16} color={tint} />
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text numberOfLines={1} className="flex-shrink text-sm font-medium text-foreground">
            {transaction.note || category?.name || 'Transaction'}
          </Text>
          {transaction.recurringId ? <Repeat size={12} color={colors.mutedForeground} /> : null}
        </View>
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {transaction.type === 'transfer' && toAccount
            ? `${account?.name ?? '?'} → ${toAccount.name}`
            : (account?.name ?? 'Unknown account')}
          {` · ${formatTime(transaction.date)}`}
        </Text>
      </View>
      <Text className="text-sm font-semibold" style={{ color: amountColor }}>
        {amountPrefix}
        {formatCurrency(transaction.amount, currency)}
      </Text>
    </Pressable>
  );
});
