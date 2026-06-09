import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, containerClassName, className, ...rest },
  ref,
) {
  const colors = useThemeColors();
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.mutedForeground}
        className={cn(
          'rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground',
          error && 'border-destructive',
          className,
        )}
        {...rest}
      />
      {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
    </View>
  );
});
