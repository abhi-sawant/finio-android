import { useMemo } from 'react';
import { Plus, CreditCard, Wallet } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatters';
import { getTotalAccountBalance, getTotalCreditOutstanding } from '@/utils/calculations';
import { AccountCard } from '@/components/accounts/AccountCard';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { GradientView } from '@/components/ui/GradientView';
import { Button } from '@/components/ui/Button';
import { glowShadow } from '@/lib/gradients';
import { confirm } from '@/lib/confirm';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { Account } from '@/types';

export default function AccountsScreen() {
  const accounts = useFinanceStore((s) => s.accounts);
  const currency = useFinanceStore((s) => s.settings.currency);
  const deleteAccount = useFinanceStore((s) => s.deleteAccount);
  const colors = useThemeColors();

  const totalBalance = useMemo(() => getTotalAccountBalance(accounts), [accounts]);
  const creditDue = useMemo(() => getTotalCreditOutstanding(accounts), [accounts]);
  const regularAccounts = useMemo(() => accounts.filter((a) => a.type !== 'credit'), [accounts]);
  const creditAccounts = useMemo(() => accounts.filter((a) => a.type === 'credit'), [accounts]);

  const handleDelete = async (id: string, name: string) => {
    if (
      await confirm(`Delete "${name}"? All associated transactions will also be deleted.`, {
        destructive: true,
        confirmLabel: 'Delete',
      })
    ) {
      deleteAccount(id);
    }
  };

  const grid = (items: Account[]) => (
    <View className="flex-row flex-wrap gap-3">
      {items.map((account) => (
        <View key={account.id} style={{ width: '47%' }}>
          <AccountCard
            account={account}
            variant="grid"
            onPress={() =>
              router.push({ pathname: '/edit-account/[id]', params: { id: account.id } })
            }
            onDelete={() => handleDelete(account.id, account.name)}
          />
        </View>
      ))}
    </View>
  );

  return (
    <ScreenContainer bottomInset={96}>
      <Header
        title="Accounts"
        right={
          <Pressable onPress={() => router.push('/add-account')} className="active:opacity-80">
            <GradientView
              name="primary"
              style={[
                {
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                glowShadow.primary,
              ]}>
              <Plus size={18} color="#fff" />
            </GradientView>
          </Pressable>
        }
      />

      <View className="flex-row gap-3">
        <Card className="flex-1">
          <View className="mb-1 flex-row items-center gap-1.5">
            <Wallet size={12} color={colors.primary} />
            <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Net Balance
            </Text>
          </View>
          <Text className="text-lg font-bold text-foreground">
            {formatCurrency(totalBalance, currency, true)}
          </Text>
        </Card>
        {creditAccounts.length > 0 ? (
          <Card className="flex-1">
            <View className="mb-1 flex-row items-center gap-1.5">
              <CreditCard size={12} color="#f43f5e" />
              <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Credit Due
              </Text>
            </View>
            <Text className="text-lg font-bold" style={{ color: '#f43f5e' }}>
              {formatCurrency(creditDue, currency, true)}
            </Text>
          </Card>
        ) : null}
      </View>

      {regularAccounts.length > 0 ? (
        <View className="gap-3">
          <Text className="text-sm font-medium text-muted-foreground">Accounts</Text>
          {grid(regularAccounts)}
        </View>
      ) : null}

      {creditAccounts.length > 0 ? (
        <View className="gap-3">
          <Text className="text-sm font-medium text-muted-foreground">Credit Cards</Text>
          {grid(creditAccounts)}
        </View>
      ) : null}

      {accounts.length === 0 ? (
        <View className="items-center gap-4 py-12">
          <Text className="text-muted-foreground">No accounts yet</Text>
          <View className="w-48">
            <Button title="Add Account" onPress={() => router.push('/add-account')} />
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
