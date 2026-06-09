import { CalendarDays, X } from 'lucide-react-native';
import { Platform, Pressable, Text } from 'react-native';
import { format, parse } from 'date-fns';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { useThemeColors } from '@/hooks/use-theme-colors';

interface Props {
  /** yyyy-MM-dd or '' */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Date-only picker producing a yyyy-MM-dd string (matches the web filter contract). */
export function DateInput({ value, onChange, placeholder = 'Select date' }: Props) {
  const colors = useThemeColors();
  const current = value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date();

  const open = () => {
    if (Platform.OS !== 'android') return;
    DateTimePickerAndroid.open({
      value: current,
      mode: 'date',
      onChange: (_e, picked) => {
        if (picked) onChange(format(picked, 'yyyy-MM-dd'));
      },
    });
  };

  return (
    <Pressable
      onPress={open}
      className="flex-row items-center justify-between rounded-lg border border-input bg-muted px-3 py-2 active:opacity-80">
      <Text className={value ? 'text-sm text-foreground' : 'text-sm text-muted-foreground'}>
        {value ? format(current, 'dd MMM yyyy') : placeholder}
      </Text>
      {value ? (
        <Pressable hitSlop={8} onPress={() => onChange('')}>
          <X size={14} color={colors.mutedForeground} />
        </Pressable>
      ) : (
        <CalendarDays size={14} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}
