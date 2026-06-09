import { useMemo, useState } from 'react';
import { Plus, Trash2, Repeat } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency, formatFullDate, toLocalDateTimeInputValue } from '@/utils/formatters';
import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { NumberPad } from '@/components/ui/NumberPad';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { GradientView } from '@/components/ui/GradientView';
import { toast } from '@/lib/toast';
import { confirm } from '@/lib/confirm';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { RecurrenceFrequency } from '@/types';

const FREQ_LABEL: Record<RecurrenceFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function Recurring() {
  const recurring = useFinanceStore((s) => s.recurring);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const currency = useFinanceStore((s) => s.settings.currency);
  const addRecurring = useFinanceStore((s) => s.addRecurring);
  const deleteRecurring = useFinanceStore((s) => s.deleteRecurring);
  const processRecurring = useFinanceStore((s) => s.processRecurring);
  const colors = useThemeColors();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [startDate, setStartDate] = useState(toLocalDateTimeInputValue(new Date()));

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type || c.type === 'both'),
    [categories, type],
  );

  const handleSubmit = () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return toast.error('Enter a valid amount');
    if (!accountId) return toast.error('Select an account');
    if (!categoryId) return toast.error('Select a category');

    addRecurring({
      type,
      amount: parsed,
      accountId,
      categoryId,
      note,
      labels: [],
      frequency,
      startDate: new Date(startDate).toISOString(),
    });
    const generated = processRecurring();
    toast.success(
      `Recurring rule created${generated > 0 ? ` · added ${generated} past-due transaction${generated === 1 ? '' : 's'}` : ''}`,
    );
    setShowForm(false);
    setAmount('');
    setNote('');
    setCategoryId('');
    setFrequency('monthly');
    setStartDate(toLocalDateTimeInputValue(new Date()));
  };

  return (
    <ScreenContainer bottomInset={40}>
      <Header
        title="Recurring"
        back
        right={
          <Pressable
            onPress={() => accounts.length > 0 && setShowForm((v) => !v)}
            hitSlop={8}
            className={`h-9 w-9 items-center justify-center ${accounts.length === 0 ? 'opacity-30' : ''}`}>
            <Plus size={20} color={colors.primary} />
          </Pressable>
        }
      />

      {accounts.length === 0 ? (
        <Text className="py-8 text-center text-sm text-muted-foreground">
          Add an account first to create recurring rules.
        </Text>
      ) : null}

      {showForm ? (
        <Card className="gap-3">
          <View className="flex-row gap-2 rounded-xl bg-muted p-1">
            {(['expense', 'income'] as const).map((t) => {
              const active = type === t;
              const inner = (
                <Text className={`text-center text-xs font-medium capitalize ${active ? 'text-white' : 'text-muted-foreground'}`}>
                  {t}
                </Text>
              );
              return (
                <Pressable
                  key={t}
                  onPress={() => {
                    setType(t);
                    setCategoryId('');
                  }}
                  className="flex-1">
                  {active ? (
                    <GradientView name={t === 'expense' ? 'danger' : 'success'} style={{ borderRadius: 8, paddingVertical: 8 }}>
                      {inner}
                    </GradientView>
                  ) : (
                    <View className="rounded-lg py-2">{inner}</View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="gap-1.5">
            <Text className="text-xs font-medium text-muted-foreground">Amount</Text>
            <NumberPad value={amount} onChange={setAmount} />
          </View>

          <Select
            label="Account"
            value={accountId || null}
            options={accounts.map((a) => ({ label: a.name, value: a.id }))}
            onChange={setAccountId}
            placeholder="Account"
          />
          <Select
            label="Category"
            value={categoryId || null}
            options={filteredCategories.map((c) => ({ label: c.name, value: c.id }))}
            onChange={setCategoryId}
            placeholder="Category"
          />
          <Input label="Note" placeholder="Note (e.g., Netflix)" value={note} onChangeText={setNote} />
          <Select
            label="Frequency"
            value={frequency}
            options={(Object.keys(FREQ_LABEL) as RecurrenceFrequency[]).map((f) => ({ label: FREQ_LABEL[f], value: f }))}
            onChange={(v) => setFrequency(v)}
          />
          <DateTimePicker label="Start Date" value={startDate} onChange={setStartDate} />

          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button title="Save Rule" onPress={handleSubmit} />
            </View>
            <Button title="Cancel" variant="secondary" fullWidth={false} onPress={() => setShowForm(false)} />
          </View>
        </Card>
      ) : null}

      {recurring.length === 0 && !showForm && accounts.length > 0 ? (
        <View className="items-center gap-4 py-12">
          <GradientView name="info" style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}>
            <Repeat size={22} color="#fff" />
          </GradientView>
          <Text className="text-muted-foreground">No recurring rules yet</Text>
          <View className="w-44">
            <Button title="Create a rule" onPress={() => setShowForm(true)} />
          </View>
        </View>
      ) : null}

      <View className="gap-2">
        {recurring.map((r) => {
          const cat = categories.find((c) => c.id === r.categoryId);
          const acc = accounts.find((a) => a.id === r.accountId);
          const color = cat?.color ?? '#94a3b8';
          return (
            <Card key={r.id} className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                <Repeat size={16} color="#fff" />
              </View>
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="text-sm font-medium text-foreground">
                  {r.note || cat?.name || 'Recurring'}
                </Text>
                <Text numberOfLines={1} className="text-xs text-muted-foreground">
                  {FREQ_LABEL[r.frequency]} · {acc?.name ?? 'Unknown'}
                  {r.lastRunDate ? ` · last ${formatFullDate(r.lastRunDate)}` : ''}
                </Text>
              </View>
              <Text className="text-sm font-semibold" style={{ color: r.type === 'income' ? '#10b981' : '#f43f5e' }}>
                {r.type === 'income' ? '+' : '-'}
                {formatCurrency(r.amount, currency, true)}
              </Text>
              <Pressable
                onPress={async () => {
                  if (await confirm('Delete this recurring rule? Past transactions will be kept.', { destructive: true, confirmLabel: 'Delete' }))
                    deleteRecurring(r.id);
                }}
                hitSlop={6}
                className="h-7 w-7 items-center justify-center">
                <Trash2 size={13} color={colors.destructive} />
              </Pressable>
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
