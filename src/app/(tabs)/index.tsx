import { useMemo } from 'react';
import { getHours, parseISO, addDays, addMonths, addYears, differenceInCalendarDays } from 'date-fns';
import {
  Settings2,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  CalendarRange,
  PiggyBank,
  Target,
  AlertTriangle,
  Repeat,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency, formatPercentChange } from '@/utils/formatters';
import {
  getTotalIncome,
  getTotalExpenses,
  getTotalAccountBalance,
  getTotalCreditOutstanding,
  getCurrentMonthTransactions,
  getPreviousMonthTransactions,
  getDashboardStats,
  sortTransactionsDateDesc,
  computeBudgetStatuses,
} from '@/utils/calculations';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { AccountCard } from '@/components/accounts/AccountCard';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { GradientView } from '@/components/ui/GradientView';
import { glowShadow } from '@/lib/gradients';
import { useThemeColors } from '@/hooks/use-theme-colors';

function getGreeting(): string {
  const hour = getHours(new Date());
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const accounts = useFinanceStore((s) => s.accounts);
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const budgets = useFinanceStore((s) => s.budgets);
  const recurring = useFinanceStore((s) => s.recurring);
  const userName = useFinanceStore((s) => s.settings.userName);
  const currency = useFinanceStore((s) => s.settings.currency);
  const colors = useThemeColors();

  const monthTxns = useMemo(() => getCurrentMonthTransactions(transactions), [transactions]);
  const prevMonthTxns = useMemo(() => getPreviousMonthTransactions(transactions), [transactions]);
  const totalBalance = useMemo(() => getTotalAccountBalance(accounts), [accounts]);
  const creditOutstanding = useMemo(() => getTotalCreditOutstanding(accounts), [accounts]);
  const afterDues = totalBalance - creditOutstanding;
  const monthIncome = useMemo(() => getTotalIncome(monthTxns), [monthTxns]);
  const monthExpenses = useMemo(() => getTotalExpenses(monthTxns), [monthTxns]);
  const recentTxns = useMemo(() => sortTransactionsDateDesc(transactions).slice(0, 5), [transactions]);
  const stats = useMemo(
    () => getDashboardStats(monthTxns, prevMonthTxns, categories),
    [monthTxns, prevMonthTxns, categories],
  );
  const allBudgetStatuses = useMemo(() => computeBudgetStatuses(budgets, monthTxns), [budgets, monthTxns]);
  const overallBudget = useMemo(
    () => allBudgetStatuses.find((s) => s.budget.categoryId === '') ?? null,
    [allBudgetStatuses],
  );
  const nearLimitBudgets = useMemo(
    () => allBudgetStatuses.filter((s) => s.percent >= 85),
    [allBudgetStatuses],
  );
  const upcomingRecurring = useMemo(() => {
    const now = new Date();
    return recurring
      .map((r) => {
        let nextDue: Date;
        if (r.lastRunDate === null) {
          nextDue = parseISO(r.startDate);
        } else {
          const base = parseISO(r.lastRunDate);
          if (r.frequency === 'daily') nextDue = addDays(base, 1);
          else if (r.frequency === 'weekly') nextDue = addDays(base, 7);
          else if (r.frequency === 'monthly') nextDue = addMonths(base, 1);
          else nextDue = addYears(base, 1);
        }
        return { rule: r, nextDue, daysUntil: differenceInCalendarDays(nextDue, now) };
      })
      .filter(({ daysUntil }) => daysUntil >= 0 && daysUntil <= 7)
      .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());
  }, [recurring]);

  return (
    <ScreenContainer bottomInset={96}>
      <View className="flex-row items-center justify-between px-3 pb-1 pt-1">
        <View>
          <Text className="text-sm text-muted-foreground">{getGreeting()},</Text>
          <Text className="text-xl font-bold text-foreground">{userName} 👋</Text>
        </View>
        <Pressable
          onPress={() => router.navigate('/settings')}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card active:bg-muted">
          <Settings2 size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Hero balance card */}
      <GradientView name="primary" style={[{ borderRadius: 24, padding: 20 }, glowShadow.primary]}>
        <View className="mb-1 flex-row items-center gap-2">
          <Wallet size={14} color="#fff" />
          <Text className="text-xs font-medium uppercase tracking-wide text-white/90">Total Balance</Text>
        </View>
        <Text className="text-3xl font-bold tracking-tight text-white">
          {formatCurrency(totalBalance, currency)}
        </Text>
        {creditOutstanding > 0 ? (
          <Text className="mt-1 text-xs text-white/80">
            After Dues: {formatCurrency(afterDues, currency)}
          </Text>
        ) : null}
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-white/15 px-3 py-2">
            <View className="mb-0.5 flex-row items-center gap-1.5">
              <TrendingUp size={12} color="#fff" />
              <Text className="text-[10px] uppercase tracking-wide text-white/90">Income</Text>
            </View>
            <Text className="text-sm font-semibold text-white">
              {formatCurrency(monthIncome, currency, true)}
            </Text>
          </View>
          <View className="flex-1 rounded-xl bg-white/15 px-3 py-2">
            <View className="mb-0.5 flex-row items-center gap-1.5">
              <TrendingDown size={12} color="#fff" />
              <Text className="text-[10px] uppercase tracking-wide text-white/90">Expenses</Text>
            </View>
            <Text className="text-sm font-semibold text-white">
              {formatCurrency(monthExpenses, currency, true)}
            </Text>
          </View>
        </View>
      </GradientView>

      {/* Quick stats */}
      {monthTxns.length > 0 ? (
        <View className="flex-row flex-wrap gap-3">
          <Card className="flex-1" style={{ minWidth: '46%' }}>
            <View className="mb-1 flex-row items-center gap-1.5">
              <CalendarRange size={12} color={colors.primary} />
              <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">Daily avg</Text>
            </View>
            <Text className="text-sm font-bold text-foreground">
              {formatCurrency(stats.dailyAverage, currency, true)}
            </Text>
            <Text className="mt-0.5 text-[10px] text-muted-foreground">
              Projected: {formatCurrency(stats.projectedMonth, currency, true)}
            </Text>
          </Card>
          <Card className="flex-1" style={{ minWidth: '46%' }}>
            <View className="mb-1 flex-row items-center gap-1.5">
              <PiggyBank size={12} color="#10b981" />
              <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">Savings rate</Text>
            </View>
            <Text className="text-sm font-bold text-foreground">{Math.round(stats.savingsRate * 100)}%</Text>
            {prevMonthTxns.length > 0 ? (
              <Text
                className="mt-0.5 text-[10px]"
                style={{ color: stats.monthOverMonthChange > 0 ? '#f43f5e' : '#10b981' }}>
                Spend {formatPercentChange(stats.monthOverMonthChange)} vs last mo
              </Text>
            ) : null}
          </Card>
          {stats.topCategory ? (
            <Card className="w-full flex-row items-center gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: stats.topCategory.category.color }}>
                <CategoryIcon icon={stats.topCategory.category.icon} size={18} color="#fff" />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Top category this month
                </Text>
                <Text numberOfLines={1} className="text-sm font-semibold text-foreground">
                  {stats.topCategory.category.name}
                </Text>
              </View>
              <Text className="text-sm font-bold text-foreground">
                {formatCurrency(stats.topCategory.amount, currency, true)}
              </Text>
            </Card>
          ) : null}
        </View>
      ) : null}

      {/* Budget alerts */}
      {nearLimitBudgets.length > 0 ? (
        <Pressable onPress={() => router.push('/budgets')}>
          <Card>
            <View className="mb-3 flex-row items-center gap-2">
              <View className="h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: '#f59e0b26' }}>
                <AlertTriangle size={13} color="#f59e0b" />
              </View>
              <Text className="text-sm font-semibold text-foreground">Budget Alert</Text>
              <View className="ml-auto rounded-full px-2 py-0.5" style={{ backgroundColor: '#f59e0b26' }}>
                <Text className="text-[10px] font-medium" style={{ color: '#f59e0b' }}>
                  {nearLimitBudgets.length} near limit
                </Text>
              </View>
            </View>
            <View className="gap-2.5">
              {nearLimitBudgets.map((s) => {
                const cat = categories.find((c) => c.id === s.budget.categoryId);
                const label = s.budget.categoryId === '' ? 'Overall Expenses' : (cat?.name ?? 'Unknown');
                return (
                  <View key={s.budget.id}>
                    <View className="mb-1 flex-row items-center justify-between">
                      <Text className="text-xs font-medium text-foreground">{label}</Text>
                      <Text className="text-xs font-semibold" style={{ color: s.isOver ? '#f43f5e' : '#f59e0b' }}>
                        {Math.round(s.percent)}%
                      </Text>
                    </View>
                    <View className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(s.percent, 100)}%`,
                          backgroundColor: s.isOver ? '#ef4444' : '#f59e0b',
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </Pressable>
      ) : null}

      {/* Overall budget progress */}
      {overallBudget ? (
        <Pressable onPress={() => router.push('/budgets')}>
          <Card>
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Target size={14} color={colors.primary} />
                <Text className="text-sm font-semibold text-foreground">Monthly Budget</Text>
              </View>
              <Text
                className="text-xs font-medium"
                style={{ color: overallBudget.isOver ? '#f43f5e' : colors.mutedForeground }}>
                {formatCurrency(overallBudget.spent, currency, true)} /{' '}
                {formatCurrency(overallBudget.budget.amount, currency, true)}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(overallBudget.percent, 100)}%`,
                  backgroundColor: overallBudget.isOver
                    ? '#ef4444'
                    : overallBudget.percent > 80
                      ? '#f59e0b'
                      : colors.primary,
                }}
              />
            </View>
          </Card>
        </Pressable>
      ) : null}

      {/* Upcoming recurring */}
      {upcomingRecurring.length > 0 ? (
        <Pressable onPress={() => router.push('/recurring')}>
          <Card>
            <View className="mb-3 flex-row items-center gap-2">
              <View className="h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: '#3b82f626' }}>
                <Repeat size={13} color="#3b82f6" />
              </View>
              <Text className="text-sm font-semibold text-foreground">Upcoming Bills</Text>
              <View className="ml-auto rounded-full px-2 py-0.5" style={{ backgroundColor: '#3b82f626' }}>
                <Text className="text-[10px] font-medium" style={{ color: '#3b82f6' }}>this week</Text>
              </View>
            </View>
            <View className="gap-2.5">
              {upcomingRecurring.map(({ rule, daysUntil }) => {
                const cat = categories.find((c) => c.id === rule.categoryId);
                const label = rule.note || cat?.name || 'Recurring';
                const color = cat?.color ?? '#94a3b8';
                const dueLabel =
                  daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `Due in ${daysUntil} days`;
                return (
                  <View key={rule.id} className="flex-row items-center gap-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                      <Repeat size={14} color="#fff" />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text numberOfLines={1} className="text-xs font-medium text-foreground">{label}</Text>
                      <Text className="text-[10px] text-muted-foreground">{dueLabel}</Text>
                    </View>
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: rule.type === 'income' ? '#10b981' : '#f43f5e' }}>
                      {rule.type === 'income' ? '+' : '-'}
                      {formatCurrency(rule.amount, currency, true)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </Pressable>
      ) : null}

      {/* Accounts */}
      <View>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-foreground">My Accounts</Text>
          <Pressable onPress={() => router.navigate('/accounts')}>
            <Text className="text-xs font-medium text-primary">See all</Text>
          </Pressable>
        </View>
        {accounts.length === 0 ? (
          <Pressable
            onPress={() => router.push('/add-account')}
            className="items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 p-6">
            <Plus size={24} color={colors.primary} />
            <Text className="text-sm font-medium text-primary">Add your first account</Text>
            <Text className="text-center text-xs text-muted-foreground">
              You need at least one account to record transactions.
            </Text>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onPress={() => router.push({ pathname: '/edit-account/[id]', params: { id: account.id } })}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Recent transactions */}
      <View>
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Sparkles size={14} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground">Recent Transactions</Text>
          </View>
          <Pressable onPress={() => router.navigate('/transactions')}>
            <Text className="text-xs font-medium text-primary">See all</Text>
          </Pressable>
        </View>
        {recentTxns.length === 0 ? (
          <Text className="py-8 text-center text-sm text-muted-foreground">
            No transactions yet. Tap + to add one.
          </Text>
        ) : (
          <View className="gap-2">
            {recentTxns.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                categories={categories}
                accounts={accounts}
                currency={currency}
                onPress={() => router.push({ pathname: '/edit-transaction/[id]', params: { id: tx.id } })}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
