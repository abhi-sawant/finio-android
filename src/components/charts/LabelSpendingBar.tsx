import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatters';
import { Card } from '@/components/ui/Card';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
}

export function LabelSpendingBar({ transactions }: Props) {
  const labels = useFinanceStore((s) => s.labels);
  const currency = useFinanceStore((s) => s.settings.currency);

  const data = useMemo(() => {
    const byLabel = new Map<string, number>();
    for (const tx of transactions.filter((t) => t.type === 'expense')) {
      for (const labelId of tx.labels) {
        byLabel.set(labelId, (byLabel.get(labelId) ?? 0) + tx.amount);
      }
    }
    return Array.from(byLabel.entries())
      .map(([labelId, amount]) => {
        const label = labels.find((l) => l.id === labelId);
        return { name: label?.name ?? 'Unknown', amount, color: label?.color ?? '#94a3b8' };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions, labels]);

  if (data.length === 0) return null;

  const maxAmount = data[0]?.amount ?? 1;

  return (
    <Card>
      <Text className="mb-3 text-sm font-semibold text-foreground">Spending by Label</Text>
      <View className="gap-2">
        {data.map((item) => (
          <View key={item.name} className="gap-1">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">{item.name}</Text>
              <Text className="text-xs font-medium text-foreground">
                {formatCurrency(item.amount, currency, true)}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full"
                style={{ width: `${(item.amount / maxAmount) * 100}%`, backgroundColor: item.color }}
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
