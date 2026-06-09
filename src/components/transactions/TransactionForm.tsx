import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { useFinanceStore } from '@/store/useFinanceStore';
import { toLocalDateTimeInputValue } from '@/utils/formatters';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { NumberPad } from '@/components/ui/NumberPad';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { GradientView } from '@/components/ui/GradientView';
import { toast } from '@/lib/toast';
import { confirm } from '@/lib/confirm';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { GradientName } from '@/lib/gradients';
import type { TransactionType } from '@/types';

const TYPE_GRADIENT: Record<TransactionType, GradientName> = {
  expense: 'danger',
  income: 'success',
  transfer: 'info',
};

export function TransactionForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeColors();
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const labels = useFinanceStore((s) => s.labels);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  const existing = id ? transactions.find((t) => t.id === id) : null;

  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? '');
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(existing?.toAccountId ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [date, setDate] = useState(
    existing?.date ? toLocalDateTimeInputValue(existing.date) : toLocalDateTimeInputValue(new Date()),
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(existing?.labels ?? []);

  const filteredCategories = useMemo(() => {
    if (type === 'transfer') return categories.filter((c) => c.type === 'both');
    return categories.filter((c) => c.type === type || c.type === 'both');
  }, [categories, type]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return toast.error('Enter a valid amount');
    if (!accountId) return toast.error('Select an account');
    if (type === 'transfer') {
      if (!toAccountId) return toast.error('Select a destination account');
      if (toAccountId === accountId) return toast.error('Source and destination must differ');
    } else if (!categoryId) {
      return toast.error('Select a category');
    }

    const transferCategory = categories.find((c) => c.type === 'both');
    const txData = {
      type,
      amount: parsedAmount,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type === 'transfer' ? (transferCategory?.id ?? categoryId ?? '') : categoryId,
      date: new Date(date).toISOString(),
      note,
      labels: selectedLabels,
    };

    if (existing) {
      updateTransaction(existing.id, txData);
      toast.success('Transaction updated');
    } else {
      addTransaction(txData);
      toast.success('Transaction added');
    }
    router.back();
  };

  const handleDelete = async () => {
    if (existing && (await confirm('Delete this transaction?', { destructive: true, confirmLabel: 'Delete' }))) {
      deleteTransaction(existing.id);
      toast.success('Transaction deleted');
      router.back();
    }
  };

  const toggleLabel = (labelId: string) =>
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((l) => l !== labelId) : [...prev, labelId],
    );

  return (
    <ScreenContainer bottomInset={40}>
      <Header
        title={existing ? 'Edit Transaction' : 'Add Transaction'}
        back
        right={
          existing ? (
            <Pressable onPress={handleDelete} hitSlop={8} className="h-9 w-9 items-center justify-center">
              <Trash2 size={18} color={colors.destructive} />
            </Pressable>
          ) : undefined
        }
      />

      {/* Type selector */}
      <View className="flex-row gap-2 rounded-2xl bg-muted p-1">
        {(['expense', 'income', 'transfer'] as const).map((t) => {
          const active = type === t;
          const inner = (
            <Text
              className={`text-center text-sm font-medium capitalize ${
                active ? 'text-white' : 'text-muted-foreground'
              }`}>
              {t}
            </Text>
          );
          return (
            <Pressable key={t} onPress={() => setType(t)} className="flex-1">
              {active ? (
                <GradientView
                  name={TYPE_GRADIENT[t]}
                  style={{ borderRadius: 12, paddingVertical: 8 }}>
                  {inner}
                </GradientView>
              ) : (
                <View className="rounded-xl py-2">{inner}</View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">Amount</Text>
        <NumberPad value={amount} onChange={setAmount} />
      </View>

      <Select
        label={type === 'transfer' ? 'From Account' : 'Account'}
        value={accountId || null}
        options={accounts.map((a) => ({ label: a.name, value: a.id }))}
        onChange={setAccountId}
        placeholder="Select account"
      />

      {type === 'transfer' ? (
        <Select
          label="To Account"
          value={toAccountId || null}
          options={accounts.filter((a) => a.id !== accountId).map((a) => ({ label: a.name, value: a.id }))}
          onChange={setToAccountId}
          placeholder="Select account"
        />
      ) : null}

      {type !== 'transfer' ? (
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Category</Text>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            <View className="flex-row flex-wrap gap-2">
              {filteredCategories.map((cat) => {
                const selected = categoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={{ width: '23%' }}
                    className={`flex-grow items-center gap-1 rounded-xl border p-2 ${
                      selected ? 'border-primary' : 'border-border bg-card'
                    }`}>
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: cat.color }}>
                      <CategoryIcon icon={cat.icon} size={16} color="#fff" />
                    </View>
                    <Text numberOfLines={2} className="text-center text-[10px] leading-tight text-foreground">
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : null}

      <DateTimePicker label="Date & Time" value={date} onChange={setDate} />

      <Input label="Note" placeholder="Add a note…" value={note} onChangeText={setNote} />

      {labels.length > 0 ? (
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-foreground">Labels</Text>
          <View className="flex-row flex-wrap gap-2">
            {labels.map((label) => {
              const active = selectedLabels.includes(label.id);
              return (
                <Pressable
                  key={label.id}
                  onPress={() => toggleLabel(label.id)}
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: active ? label.color : colors.muted }}>
                  <Text
                    className="text-xs font-medium"
                    style={{ color: active ? '#fff' : colors.mutedForeground }}>
                    {label.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <Button
        title={existing ? 'Update Transaction' : 'Add Transaction'}
        onPress={handleSubmit}
        disabled={!amount || !accountId}
      />
    </ScreenContainer>
  );
}
