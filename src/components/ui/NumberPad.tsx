import { Delete } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { formatInputAmount } from '@/utils/formatters';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
}

const BUTTONS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'] as const;

export function NumberPad({ value, onChange }: NumberPadProps) {
  const colors = useThemeColors();

  const handlePress = (key: string) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!value.includes('.')) onChange(value ? value + '.' : '0.');
      return;
    }
    const [intPart, dec] = value.split('.');
    if (dec !== undefined && dec.length >= 2) return;
    if (intPart.length >= 10 && dec === undefined) return;
    if (!value || value === '0') {
      onChange(key);
    } else {
      onChange(value + key);
    }
  };

  const display = formatInputAmount(value);

  return (
    <View className="gap-2">
      <View className="min-h-16 items-center justify-center rounded-2xl bg-card px-4 py-3">
        <Text
          className={`font-bold tracking-tight ${display.length > 10 ? 'text-2xl' : 'text-3xl'} ${
            !value ? 'text-muted-foreground' : 'text-foreground'
          }`}>
          {display}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {BUTTONS.map((btn) => (
          <Pressable
            key={btn}
            onPress={() => handlePress(btn)}
            style={{ width: '31.5%' }}
            className="h-14 flex-grow items-center justify-center rounded-2xl bg-card active:bg-muted active:scale-95">
            {btn === '⌫' ? (
              <Delete size={20} color={colors.mutedForeground} />
            ) : btn === '.' ? (
              <Text className="text-2xl leading-none text-muted-foreground">·</Text>
            ) : (
              <Text className="text-xl font-semibold text-foreground">{btn}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
