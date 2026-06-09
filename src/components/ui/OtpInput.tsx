import { useRef } from 'react';
import { TextInput, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';

interface Props {
  value: string[];
  onChange: (otp: string[]) => void;
}

/** Six-box numeric OTP input with auto-advance and backspace navigation. */
export function OtpInput({ value, onChange }: Props) {
  const refs = useRef<(TextInput | null)[]>([]);
  const colors = useThemeColors();

  const handleChange = (index: number, text: string) => {
    const digit = text.replace(/\D/g, '');
    // Handle paste of full code into one box
    if (digit.length > 1) {
      const next = [...value];
      for (let i = 0; i < digit.length && index + i < 6; i++) next[index + i] = digit[i];
      onChange(next);
      const focusIndex = Math.min(index + digit.length, 5);
      refs.current[focusIndex]?.focus();
      return;
    }
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !value[index] && index > 0) refs.current[index - 1]?.focus();
  };

  return (
    <View className="flex-row justify-center gap-2">
      {value.map((digit, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          onChangeText={(t) => handleChange(i, t)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
          keyboardType="number-pad"
          maxLength={6}
          selectTextOnFocus
          className="h-14 w-12 rounded-xl border border-input bg-card text-center text-xl font-bold text-foreground"
          placeholderTextColor={colors.mutedForeground}
        />
      ))}
    </View>
  );
}
