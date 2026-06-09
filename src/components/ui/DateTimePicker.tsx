import { CalendarClock } from 'lucide-react-native';
import { Platform, Pressable, Text, View } from 'react-native';
import { format, parse } from 'date-fns';
import RNDateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';

import { useThemeColors } from '@/hooks/use-theme-colors';
import { toLocalDateTimeInputValue } from '@/utils/formatters';

const FMT = "yyyy-MM-dd'T'HH:mm";

interface Props {
  label?: string;
  /** datetime-local style string: yyyy-MM-dd'T'HH:mm */
  value: string;
  onChange: (value: string) => void;
}

function toDate(value: string): Date {
  if (!value) return new Date();
  const d = parse(value, FMT, new Date());
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Native date+time picker that preserves the web `<input type="datetime-local">`
 * contract (value/onChange are strings in `yyyy-MM-dd'T'HH:mm`). On Android the
 * native dialog is two-step (date then time).
 */
export function DateTimePicker({ label, value, onChange }: Props) {
  const colors = useThemeColors();
  const [iosPicker, setIosPicker] = useState<'date' | 'time' | null>(null);
  const current = toDate(value);

  const openAndroid = () => {
    DateTimePickerAndroid.open({
      value: current,
      mode: 'date',
      onChange: (_e, picked) => {
        if (!picked) return;
        const datePart = picked;
        DateTimePickerAndroid.open({
          value: datePart,
          mode: 'time',
          is24Hour: false,
          onChange: (_e2, time) => {
            if (!time) return;
            const combined = new Date(datePart);
            combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
            onChange(toLocalDateTimeInputValue(combined));
          },
        });
      },
    });
  };

  return (
    <View className="gap-1.5">
      {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
      <Pressable
        onPress={() => (Platform.OS === 'android' ? openAndroid() : setIosPicker('date'))}
        className="flex-row items-center justify-between rounded-xl border border-input bg-card px-4 py-3 active:opacity-80">
        <Text className="text-base text-foreground">
          {format(current, 'EEE, dd MMM yyyy')} · {format(current, 'h:mm a')}
        </Text>
        <CalendarClock size={18} color={colors.mutedForeground} />
      </Pressable>

      {Platform.OS === 'ios' && iosPicker ? (
        <RNDateTimePicker
          value={current}
          mode={iosPicker}
          onChange={(_e, picked) => {
            if (picked) onChange(toLocalDateTimeInputValue(picked));
            setIosPicker(iosPicker === 'date' ? 'time' : null);
          }}
        />
      ) : null}
    </View>
  );
}
