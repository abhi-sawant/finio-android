import { useState } from 'react';
import {
  Trash2,
  Landmark,
  PiggyBank,
  Banknote,
  CreditCard,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useFinanceStore } from '@/store/useFinanceStore';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { NumberPad } from '@/components/ui/NumberPad';
import { confirm } from '@/lib/confirm';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { AccountType, Currency } from '@/types';

const TYPE_ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  'piggy-bank': PiggyBank,
  banknote: Banknote,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
  wallet: Wallet,
};

const accountTypes: { value: AccountType; label: string; icon: string }[] = [
  { value: 'checking', label: 'Checking', icon: 'landmark' },
  { value: 'savings', label: 'Savings', icon: 'piggy-bank' },
  { value: 'cash', label: 'Cash', icon: 'banknote' },
  { value: 'credit', label: 'Credit Card', icon: 'credit-card' },
  { value: 'investment', label: 'Investment', icon: 'trending-up' },
  { value: 'wallet', label: 'Wallet', icon: 'wallet' },
];

const accountColors = [
  '#6C63FF', '#ef4444', '#f97316', '#fb923c', '#f59e0b', '#fbbf24',
  '#84cc16', '#22c55e', '#10b981', '#34d399', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#60a5fa', '#3b82f6', '#8b5cf6', '#a78bfa', '#d946ef',
  '#ec4899', '#f472b6', '#64748b', '#94a3b8', '#78716c', '#6b7280',
];

export function AccountForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeColors();
  const accounts = useFinanceStore((s) => s.accounts);
  const settings = useFinanceStore((s) => s.settings);
  const addAccount = useFinanceStore((s) => s.addAccount);
  const updateAccount = useFinanceStore((s) => s.updateAccount);
  const deleteAccount = useFinanceStore((s) => s.deleteAccount);

  const existing = id ? accounts.find((a) => a.id === id) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<AccountType>(existing?.type ?? 'checking');
  const [balance, setBalance] = useState(
    existing?.type === 'credit' ? '0' : (existing?.balance?.toString() ?? '0'),
  );
  const [due, setDue] = useState(
    existing?.type === 'credit' ? Math.abs(existing.balance).toString() : '0',
  );
  const [color, setColor] = useState(existing?.color ?? accountColors[0]);
  const [currency] = useState<Currency>(existing?.currency ?? settings.currency);
  const [creditLimit, setCreditLimit] = useState(existing?.creditLimit?.toString() ?? '0');

  const handleSubmit = () => {
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      type,
      balance: type === 'credit' ? -(parseFloat(due) || 0) : parseFloat(balance) || 0,
      color,
      icon: existing?.icon ?? accountTypes.find((t) => t.value === type)?.icon ?? 'landmark',
      currency,
      creditLimit: type === 'credit' ? parseFloat(creditLimit) || undefined : undefined,
    };
    if (existing) updateAccount(existing.id, data);
    else addAccount(data);
    router.back();
  };

  const handleDelete = async () => {
    if (
      existing &&
      (await confirm(`Delete "${existing.name}"? All associated transactions will be deleted.`, {
        destructive: true,
        confirmLabel: 'Delete',
      }))
    ) {
      deleteAccount(existing.id);
      router.back();
    }
  };

  return (
    <ScreenContainer bottomInset={40}>
      <Header
        title={existing ? 'Edit Account' : 'Add Account'}
        back
        right={
          existing ? (
            <Pressable onPress={handleDelete} hitSlop={8} className="h-9 w-9 items-center justify-center">
              <Trash2 size={18} color={colors.destructive} />
            </Pressable>
          ) : undefined
        }
      />

      <Input
        label="Account Name"
        placeholder="e.g., HDFC Savings"
        value={name}
        onChangeText={setName}
      />

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">Account Type</Text>
        <View className="flex-row flex-wrap gap-2">
          {accountTypes.map((t) => {
            const Icon = TYPE_ICONS[t.icon];
            const active = type === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => setType(t.value)}
                style={{ width: '31.5%' }}
                className={`flex-grow items-center gap-1 rounded-xl border p-3 ${
                  active ? 'border-primary bg-primary/10' : 'border-border bg-card'
                }`}>
                {Icon ? <Icon size={20} color={active ? colors.primary : colors.foreground} /> : null}
                <Text className="text-xs text-foreground">{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {type === 'credit' ? (
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Current Due</Text>
          <NumberPad value={due} onChange={setDue} />
        </View>
      ) : (
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Current Balance</Text>
          <NumberPad value={balance} onChange={setBalance} />
        </View>
      )}

      {type === 'credit' ? (
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Credit Limit</Text>
          <NumberPad value={creditLimit} onChange={setCreditLimit} />
        </View>
      ) : null}

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">Color</Text>
        <View className="flex-row flex-wrap gap-3">
          {accountColors.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: c,
                borderWidth: color === c ? 2 : 0,
                borderColor: colors.foreground,
              }}
            />
          ))}
        </View>
      </View>

      <Button
        title={existing ? 'Update Account' : 'Add Account'}
        onPress={handleSubmit}
        disabled={!name.trim()}
      />
    </ScreenContainer>
  );
}
