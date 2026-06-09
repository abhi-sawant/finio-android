import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { subDays, format, differenceInDays, startOfMonth, addMonths } from 'date-fns';
import { CartesianChart, Line } from 'victory-native';

import { useFinanceStore } from '@/store/useFinanceStore';
import { Card } from '@/components/ui/Card';

interface Props {
  from: Date;
  to: Date;
}

export function BalanceTrend({ from, to }: Props) {
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);

  const data = useMemo(() => {
    const today = new Date();
    const currentBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const dayDelta = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === 'transfer') continue;
      const key = t.date.slice(0, 10);
      const delta = t.type === 'income' ? t.amount : -t.amount;
      dayDelta.set(key, (dayDelta.get(key) ?? 0) + delta);
    }

    const numDays = differenceInDays(to, from);

    if (numDays > 90) {
      const daysFromToday = differenceInDays(today, from);
      let balance = currentBalance;
      const allDaily: { dateKey: string; balance: number }[] = [];
      for (let i = 0; i <= daysFromToday; i++) {
        const day = subDays(today, i);
        const dayKey = format(day, 'yyyy-MM-dd');
        allDaily.unshift({ dateKey: dayKey, balance });
        balance -= dayDelta.get(dayKey) ?? 0;
      }
      const monthly: { date: string; balance: number }[] = [];
      let cursor = startOfMonth(from);
      while (cursor <= to) {
        const key = format(cursor, 'yyyy-MM-dd');
        const point = allDaily.find((p) => p.dateKey >= key);
        if (point) monthly.push({ date: format(cursor, 'MMM yy'), balance: point.balance });
        cursor = addMonths(cursor, 1);
      }
      const lastKey = format(to, 'yyyy-MM-dd');
      const lastPoint = [...allDaily].reverse().find((p) => p.dateKey <= lastKey);
      if (lastPoint) monthly.push({ date: format(to, 'MMM yy'), balance: lastPoint.balance });
      return monthly;
    }

    const daysFromToday = differenceInDays(today, from);
    let balance = currentBalance;
    const points: { dateKey: string; date: string; balance: number }[] = [];
    for (let i = 0; i <= daysFromToday; i++) {
      const day = subDays(today, i);
      const dayKey = format(day, 'yyyy-MM-dd');
      points.unshift({ dateKey: dayKey, date: format(day, 'dd MMM'), balance });
      balance -= dayDelta.get(dayKey) ?? 0;
    }
    const fromKey = format(from, 'yyyy-MM-dd');
    const toKey = format(to, 'yyyy-MM-dd');
    return points
      .filter((p) => p.dateKey >= fromKey && p.dateKey <= toKey)
      .map(({ date, balance }) => ({ date, balance }));
  }, [transactions, accounts, from, to]);

  if (accounts.length === 0 || data.length < 2) return null;

  return (
    <Card>
      <Text className="mb-3 text-sm font-semibold text-foreground">Balance Trend</Text>
      <View style={{ height: 180 }}>
        <CartesianChart data={data} xKey="date" yKeys={['balance']}>
          {({ points }) => <Line points={points.balance} color="#7c5cff" strokeWidth={2} curveType="natural" />}
        </CartesianChart>
      </View>
    </Card>
  );
}
