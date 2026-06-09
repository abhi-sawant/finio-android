import { useMemo, useState } from 'react';
import { Target, ChevronRight, Repeat } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { parseISO, startOfMonth, startOfDay, endOfDay, subMonths } from 'date-fns';

import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatters';
import { getTotalIncome, getTotalExpenses } from '@/utils/calculations';
import { SpendingDonut } from '@/components/charts/SpendingDonut';
import { IncomeExpenseBar } from '@/components/charts/IncomeExpenseBar';
import { BalanceTrend } from '@/components/charts/BalanceTrend';
import { LabelSpendingBar } from '@/components/charts/LabelSpendingBar';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { GradientView } from '@/components/ui/GradientView';
import { DateInput } from '@/components/ui/DateInput';
import { useThemeColors } from '@/hooks/use-theme-colors';

type FilterType = 'all' | 'month' | '3months' | '6months' | 'year' | 'custom';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'month', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

export default function Analytics() {
  const transactions = useFinanceStore((s) => s.transactions);
  const currency = useFinanceStore((s) => s.settings.currency);
  const budgets = useFinanceStore((s) => s.budgets);
  const recurring = useFinanceStore((s) => s.recurring);
  const colors = useThemeColors();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const dateRange = useMemo(() => {
    const now = new Date();
    if (selectedFilter === 'month') return { from: startOfMonth(now), to: now };
    if (selectedFilter === '3months') return { from: startOfMonth(subMonths(now, 2)), to: now };
    if (selectedFilter === '6months') return { from: startOfMonth(subMonths(now, 5)), to: now };
    if (selectedFilter === 'year') return { from: new Date(now.getFullYear(), 0, 1), to: now };
    if (selectedFilter === 'custom' && customFrom) {
      return {
        from: startOfDay(parseISO(customFrom)),
        to: customTo ? endOfDay(parseISO(customTo)) : endOfDay(parseISO(customFrom)),
      };
    }
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    return { from: sorted.length > 0 ? startOfDay(parseISO(sorted[0].date)) : startOfMonth(now), to: now };
  }, [selectedFilter, customFrom, customTo, transactions]);

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') return transactions;
    if (selectedFilter === 'custom' && !customFrom) return transactions;
    const { from, to } = dateRange;
    return transactions.filter((t) => {
      const d = parseISO(t.date);
      return d >= from && d <= to;
    });
  }, [selectedFilter, transactions, dateRange, customFrom]);

  const totalIncome = useMemo(() => getTotalIncome(filteredTransactions), [filteredTransactions]);
  const totalExpenses = useMemo(() => getTotalExpenses(filteredTransactions), [filteredTransactions]);
  const net = totalIncome - totalExpenses;

  return (
    <ScreenContainer bottomInset={96}>
      <Header title="Analytics" />

      {transactions.length === 0 ? (
        <Text className="py-12 text-center text-sm text-muted-foreground">
          Add transactions to see analytics
        </Text>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {FILTERS.map((f) => {
              const active = selectedFilter === f.value;
              const inner = (
                <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-foreground'}`}>{f.label}</Text>
              );
              return (
                <Pressable key={f.value} onPress={() => setSelectedFilter(f.value)}>
                  {active ? (
                    <GradientView name="primary" style={{ borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
                      {inner}
                    </GradientView>
                  ) : (
                    <View className="rounded-[10px] border border-border bg-card px-3.5 py-2">{inner}</View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedFilter === 'custom' ? (
            <View className="flex-row gap-2">
              <View className="flex-1 gap-1.5">
                <Text className="text-xs font-medium text-muted-foreground">From</Text>
                <DateInput value={customFrom} onChange={setCustomFrom} placeholder="Start date" />
              </View>
              <View className="flex-1 gap-1.5">
                <Text className="text-xs font-medium text-muted-foreground">To</Text>
                <DateInput value={customTo} onChange={setCustomTo} placeholder="End date" />
              </View>
            </View>
          ) : null}

          <Card>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">Income</Text>
                <Text className="text-sm font-semibold" style={{ color: '#10b981' }}>
                  {formatCurrency(totalIncome, currency, true)}
                </Text>
              </View>
              <View>
                <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">Expenses</Text>
                <Text className="text-sm font-semibold" style={{ color: '#f43f5e' }}>
                  {formatCurrency(totalExpenses, currency, true)}
                </Text>
              </View>
              <View>
                <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">Net</Text>
                <Text className="text-sm font-semibold" style={{ color: net >= 0 ? '#10b981' : '#f43f5e' }}>
                  {formatCurrency(net, currency, true)}
                </Text>
              </View>
            </View>
          </Card>

          <SpendingDonut transactions={filteredTransactions} />
          <IncomeExpenseBar transactions={filteredTransactions} />
          <BalanceTrend from={dateRange.from} to={dateRange.to} />
          <LabelSpendingBar transactions={filteredTransactions} />
        </>
      )}

      <Card className="overflow-hidden p-0">
        <Pressable onPress={() => router.push('/budgets')} className="flex-row items-center justify-between p-4 active:bg-muted/50">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary + '22' }}>
              <Target size={16} color={colors.primary} />
            </View>
            <View>
              <Text className="text-sm font-medium text-foreground">Budgets</Text>
              <Text className="text-xs text-muted-foreground">
                {budgets.length === 0 ? 'Set monthly limits' : `${budgets.length} active`}
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color={colors.mutedForeground} />
        </Pressable>
        <View className="h-px bg-border" />
        <Pressable onPress={() => router.push('/recurring')} className="flex-row items-center justify-between p-4 active:bg-muted/50">
          <View className="flex-row items-center gap-3">
            <GradientView name="info" style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
              <Repeat size={16} color="#fff" />
            </GradientView>
            <View>
              <Text className="text-sm font-medium text-foreground">Recurring Transactions</Text>
              <Text className="text-xs text-muted-foreground">
                {recurring.length === 0 ? 'Automate repeating items' : `${recurring.length} active`}
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color={colors.mutedForeground} />
        </Pressable>
      </Card>
    </ScreenContainer>
  );
}
