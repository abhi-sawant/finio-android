import { useMemo, useState, useCallback } from 'react';
import { Search, Filter, X, Download } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useFinanceStore } from '@/store/useFinanceStore';
import { formatDate } from '@/utils/formatters';
import { groupTransactionsByDate, transactionsToCsv } from '@/utils/calculations';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DateInput } from '@/components/ui/DateInput';
import { Card } from '@/components/ui/Card';
import { GradientView } from '@/components/ui/GradientView';
import { shareTextFile } from '@/lib/files';
import { toast } from '@/lib/toast';
import { glowShadow } from '@/lib/gradients';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { Transaction, TransactionType } from '@/types';

type Row = { kind: 'header'; date: string } | { kind: 'tx'; tx: Transaction };

export default function TransactionsScreen() {
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const accounts = useFinanceStore((s) => s.accounts);
  const currency = useFinanceStore((s) => s.settings.currency);
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const catMap = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));
    const q = search.trim().toLowerCase();
    const fromMs = fromDate ? new Date(fromDate + 'T00:00:00').getTime() : null;
    const toMs = toDate ? new Date(toDate + 'T23:59:59').getTime() : null;

    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (accountFilter !== 'all' && t.accountId !== accountFilter && t.toAccountId !== accountFilter)
        return false;
      if (fromMs !== null || toMs !== null) {
        const ts = new Date(t.date).getTime();
        if (fromMs !== null && ts < fromMs) return false;
        if (toMs !== null && ts > toMs) return false;
      }
      if (q) {
        if (t.note.toLowerCase().includes(q)) return true;
        const catName = catMap.get(t.categoryId);
        return catName?.includes(q) ?? false;
      }
      return true;
    });
  }, [transactions, search, typeFilter, accountFilter, categories, fromDate, toDate]);

  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    }
    return { totalIncome: income, totalExpense: expense };
  }, [filtered]);

  const rows = useMemo<Row[]>(() => {
    const groups = groupTransactionsByDate(filtered);
    const out: Row[] = [];
    for (const group of groups) {
      out.push({ kind: 'header', date: group.date });
      for (const tx of group.transactions) out.push({ kind: 'tx', tx });
    }
    return out;
  }, [filtered]);

  const hasActiveFilters = typeFilter !== 'all' || accountFilter !== 'all' || !!fromDate || !!toDate;

  const handleExportCsv = async () => {
    if (filtered.length === 0) return toast.error('No transactions to export');
    const csv = transactionsToCsv(filtered, categories, accounts);
    await shareTextFile(
      `finio-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv',
    );
    toast.success(`Exported ${filtered.length} transactions`);
  };

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.kind === 'header') {
        return (
          <Text className="pb-2 pt-1 text-xs font-medium text-muted-foreground">
            {formatDate(item.date)}
          </Text>
        );
      }
      return (
        <View className="pb-2">
          <TransactionItem
            transaction={item.tx}
            categories={categories}
            accounts={accounts}
            currency={currency}
            onPress={() =>
              router.push({ pathname: '/edit-transaction/[id]', params: { id: item.tx.id } })
            }
          />
        </View>
      );
    },
    [categories, accounts, currency],
  );

  const ListHeader = (
    <View className="gap-3 pb-2">
      <View className="justify-center">
        <View className="absolute left-3 z-10">
          <Search size={16} color={colors.mutedForeground} />
        </View>
        <Input
          placeholder="Search notes or categories…"
          value={search}
          onChangeText={setSearch}
          className="rounded-xl bg-card py-2.5 pl-9 pr-4"
        />
      </View>

      {showFilters ? (
        <Card className="gap-3">
          <View className="gap-1.5">
            <Text className="text-xs font-medium text-muted-foreground">Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {(['all', 'expense', 'income', 'transfer'] as const).map((t) => {
                const active = typeFilter === t;
                const chip = (
                  <Text
                    className={`text-xs font-medium capitalize ${active ? 'text-white' : 'text-muted-foreground'}`}>
                    {t}
                  </Text>
                );
                return (
                  <Pressable key={t} onPress={() => setTypeFilter(t)}>
                    {active ? (
                      <GradientView
                        name="primary"
                        style={{ borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                        {chip}
                      </GradientView>
                    ) : (
                      <View className="rounded-lg bg-muted px-3 py-1.5">{chip}</View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Select
            label="Account"
            value={accountFilter}
            options={[
              { label: 'All Accounts', value: 'all' },
              ...accounts.map((a) => ({ label: a.name, value: a.id })),
            ]}
            onChange={setAccountFilter}
          />

          <View className="flex-row gap-2">
            <View className="flex-1 gap-1.5">
              <Text className="text-xs font-medium text-muted-foreground">From</Text>
              <DateInput value={fromDate} onChange={setFromDate} placeholder="Start date" />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="text-xs font-medium text-muted-foreground">To</Text>
              <DateInput value={toDate} onChange={setToDate} placeholder="End date" />
            </View>
          </View>

          {hasActiveFilters ? (
            <Pressable
              onPress={() => {
                setTypeFilter('all');
                setAccountFilter('all');
                setFromDate('');
                setToDate('');
              }}
              className="flex-row items-center gap-1">
              <X size={12} color={colors.destructive} />
              <Text className="text-xs font-medium text-destructive">Clear filters</Text>
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      <View className="flex-row items-center justify-end gap-1">
        <Text className="text-xs text-muted-foreground">
          {totalIncome > totalExpense ? 'Total Earned:' : 'Total Spent:'}
        </Text>
        <Text
          className="text-xs font-bold"
          style={{ color: totalIncome > totalExpense ? '#22c55e' : '#ef4444' }}>
          {currency} {totalIncome > totalExpense ? totalIncome : totalExpense}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Header
        title="Transactions"
        right={
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleExportCsv}
              className="h-9 w-9 items-center justify-center rounded-full bg-card active:opacity-70">
              <Download size={16} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={() => setShowFilters((v) => !v)}
              className="h-9 w-9 items-center justify-center overflow-hidden rounded-full active:opacity-70">
              {hasActiveFilters ? (
                <GradientView
                  name="primary"
                  style={[
                    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
                    glowShadow.primary,
                  ]}>
                  <Filter size={16} color="#fff" />
                </GradientView>
              ) : (
                <View className="h-9 w-9 items-center justify-center rounded-full bg-card">
                  <Filter size={16} color={colors.foreground} />
                </View>
              )}
            </Pressable>
          </View>
        }
      />
      <FlashList
        data={rows}
        keyExtractor={(item, i) =>
          (item.kind === 'header' ? `h-${item.date}` : `t-${item.tx.id}`) + i
        }
        renderItem={renderItem}
        getItemType={(item) => item.kind}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View className="py-12">
            <Text className="text-center text-muted-foreground">No transactions found</Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 96 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}
