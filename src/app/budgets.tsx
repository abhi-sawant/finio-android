import { useMemo, useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatters';
import { getCurrentMonthTransactions, computeBudgetStatuses } from '@/utils/calculations';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { NumberPad } from '@/components/ui/NumberPad';
import { toast } from '@/lib/toast';
import { confirm } from '@/lib/confirm';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function Budgets() {
  const budgets = useFinanceStore((s) => s.budgets);
  const categories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const currency = useFinanceStore((s) => s.settings.currency);
  const addBudget = useFinanceStore((s) => s.addBudget);
  const deleteBudget = useFinanceStore((s) => s.deleteBudget);
  const colors = useThemeColors();

  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('__overall__');
  const [amount, setAmount] = useState('');

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense' || c.type === 'both'),
    [categories],
  );
  const monthTxns = useMemo(() => getCurrentMonthTransactions(transactions), [transactions]);
  const statuses = useMemo(() => computeBudgetStatuses(budgets, monthTxns), [budgets, monthTxns]);
  const sortedStatuses = useMemo(
    () =>
      [...statuses].sort((a, b) => {
        if (a.budget.categoryId === '') return -1;
        if (b.budget.categoryId === '') return 1;
        return b.percent - a.percent;
      }),
    [statuses],
  );

  const handleSubmit = () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return toast.error('Enter a valid budget amount');
    addBudget({ categoryId: categoryId === '__overall__' ? '' : categoryId, amount: parsed });
    toast.success('Budget saved');
    setShowForm(false);
    setAmount('');
    setCategoryId('__overall__');
  };

  return (
    <ScreenContainer bottomInset={40}>
      <Header
        title="Budgets"
        back
        right={
          <Pressable onPress={() => setShowForm((v) => !v)} hitSlop={8} className="h-9 w-9 items-center justify-center">
            <Plus size={20} color={colors.primary} />
          </Pressable>
        }
      />

      {showForm ? (
        <Card className="gap-3">
          <Select
            label="Scope"
            value={categoryId}
            options={[
              { label: 'Overall (all expenses)', value: '__overall__' },
              ...expenseCategories.map((c) => ({ label: c.name, value: c.id })),
            ]}
            onChange={setCategoryId}
          />
          <View className="gap-1.5">
            <Text className="text-xs font-medium text-muted-foreground">Monthly Limit</Text>
            <NumberPad value={amount} onChange={setAmount} />
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button title="Save" onPress={handleSubmit} />
            </View>
            <Button
              title="Cancel"
              variant="secondary"
              fullWidth={false}
              onPress={() => {
                setShowForm(false);
                setAmount('');
                setCategoryId('__overall__');
              }}
            />
          </View>
        </Card>
      ) : null}

      {sortedStatuses.length === 0 ? (
        <View className="items-center gap-4 py-12">
          <View className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary + '22' }}>
            <Target size={22} color={colors.primary} />
          </View>
          <Text className="text-muted-foreground">No budgets yet</Text>
          <View className="w-56">
            <Button title="Create your first budget" onPress={() => setShowForm(true)} />
          </View>
        </View>
      ) : (
        <View className="gap-3">
          {sortedStatuses.map((s) => {
            const cat = expenseCategories.find((c) => c.id === s.budget.categoryId);
            const isOverall = s.budget.categoryId === '';
            const color = isOverall ? '#7c5cff' : (cat?.color ?? '#94a3b8');
            const label = isOverall ? 'Overall Expenses' : (cat?.name ?? 'Unknown');
            return (
              <Card key={s.budget.id}>
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                      {isOverall ? (
                        <Target size={16} color="#fff" />
                      ) : (
                        <CategoryIcon icon={cat?.icon ?? 'circle-ellipsis'} size={16} color="#fff" />
                      )}
                    </View>
                    <Text numberOfLines={1} className="text-sm font-medium text-foreground">{label}</Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      if (await confirm(`Delete budget for "${label}"?`, { destructive: true, confirmLabel: 'Delete' }))
                        deleteBudget(s.budget.id);
                    }}
                    hitSlop={8}
                    className="h-7 w-7 items-center justify-center">
                    <Trash2 size={13} color={colors.destructive} />
                  </Pressable>
                </View>
                <View className="mb-1.5 flex-row justify-between">
                  <Text className="text-xs" style={{ color: s.isOver ? '#f43f5e' : colors.mutedForeground }}>
                    {formatCurrency(s.spent, currency)} of {formatCurrency(s.budget.amount, currency)}
                  </Text>
                  <Text className="text-xs font-medium" style={{ color: s.isOver ? '#f43f5e' : colors.mutedForeground }}>
                    {Math.round(s.percent)}%
                  </Text>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-muted">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(s.percent, 100)}%`,
                      backgroundColor: s.isOver ? '#ef4444' : s.percent > 80 ? '#f59e0b' : color,
                    }}
                  />
                </View>
                <Text className="mt-1.5 text-[11px] text-muted-foreground">
                  {s.isOver
                    ? `Over by ${formatCurrency(-s.remaining, currency)}`
                    : `${formatCurrency(s.remaining, currency)} left this month`}
                </Text>
              </Card>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
