import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Pie, PolarChart } from 'victory-native';

import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatters';
import { Card } from '@/components/ui/Card';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
}

export function SpendingDonut({ transactions }: Props) {
  const categories = useFinanceStore((s) => s.categories);
  const currency = useFinanceStore((s) => s.settings.currency);

  const data = useMemo(() => {
    const catMap = new Map(categories.map((c) => [c.id, c]));
    const byCategory = new Map<string, number>();
    for (const tx of transactions.filter((t) => t.type === 'expense')) {
      byCategory.set(tx.categoryId, (byCategory.get(tx.categoryId) ?? 0) + tx.amount);
    }
    return Array.from(byCategory.entries())
      .map(([catId, amount]) => {
        const cat = catMap.get(catId);
        return { name: cat?.name ?? 'Other', value: amount, color: cat?.color ?? '#94a3b8' };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, categories]);

  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <Text className="mb-3 text-sm font-semibold text-foreground">Spending by Category</Text>
      <View className="items-center">
        <View style={{ height: 220, width: 220 }}>
          <PolarChart data={data} labelKey="name" valueKey="value" colorKey="color">
            <Pie.Chart innerRadius="62%" />
          </PolarChart>
          <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
            <Text className="text-[10px] text-muted-foreground">Total</Text>
            <Text className="text-sm font-bold text-foreground">
              {formatCurrency(total, currency, true)}
            </Text>
          </View>
        </View>
      </View>
      <View className="mt-3 gap-1.5">
        {data.map((item) => (
          <View key={item.name} className="flex-row items-center justify-between">
            <View className="min-w-0 flex-row items-center gap-2">
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
              <Text numberOfLines={1} className="text-xs text-muted-foreground">{item.name}</Text>
            </View>
            <Text className="text-xs font-medium text-foreground">
              {formatCurrency(item.value, currency, true)}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
