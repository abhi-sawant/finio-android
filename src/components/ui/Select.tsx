import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/hooks/use-theme-colors';

export interface SelectOption<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  label?: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const colors = useThemeColors();
  const selected = options.find((o) => o.value === value);

  return (
    <View className="gap-1.5">
      {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-input bg-card px-4 py-3 active:opacity-80">
        <Text className={cn('text-base', selected ? 'text-foreground' : 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color={colors.mutedForeground} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setOpen(false)}>
          <Pressable className="max-h-[70%] rounded-t-3xl bg-card p-4" onPress={() => {}}>
            {label ? (
              <Text className="mb-3 text-center text-base font-semibold text-foreground">{label}</Text>
            ) : null}
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between rounded-xl px-3 py-3 active:bg-muted">
                    <Text className={cn('text-base', active ? 'text-primary' : 'text-foreground')}>
                      {item.label}
                    </Text>
                    {active ? <Check size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
