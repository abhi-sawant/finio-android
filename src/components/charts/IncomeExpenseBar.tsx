import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { format } from 'date-fns';
import { CartesianChart, BarGroup } from 'victory-native';

import { Card } from '@/components/ui/Card';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
}

export function IncomeExpenseBar({ transactions }: Props) {
  const data = useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number }>();
    for (const t of transactions) {
      if (t.type !== 'income' && t.type !== 'expense') continue;
      const key = t.date.slice(0, 7);
      const entry = monthMap.get(key) ?? { income: 0, expenses: 0 };
      if (t.type === 'income') entry.income += t.amount;
      else entry.expenses += t.amount;
      monthMap.set(key, entry);
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { income, expenses }]) => {
        const [year, month] = key.split('-').map(Number);
        return { month: format(new Date(year, month - 1), 'MMM yy'), income, expenses };
      });
  }, [transactions]);

  const hasData = data.some((d) => d.income > 0 || d.expenses > 0);
  if (!hasData) return null;

  return (
    <Card>
      <Text className="mb-3 text-sm font-semibold text-foreground">Income vs Expenses</Text>
      <View style={{ height: 200 }}>
        <CartesianChart data={data} xKey="month" yKeys={['income', 'expenses']} domainPadding={{ left: 40, right: 40, top: 20 }}>
          {({ points, chartBounds }) => (
            <BarGroup chartBounds={chartBounds} betweenGroupPadding={0.3} withinGroupPadding={0.1}>
              <BarGroup.Bar points={points.income} color="#16c47f" />
              <BarGroup.Bar points={points.expenses} color="#ef4444" />
            </BarGroup>
          )}
        </CartesianChart>
      </View>
      <View className="mt-2 flex-row justify-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#16c47f' }} />
          <Text className="text-xs text-muted-foreground">Income</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' }} />
          <Text className="text-xs text-muted-foreground">Expenses</Text>
        </View>
      </View>
    </Card>
  );
}
