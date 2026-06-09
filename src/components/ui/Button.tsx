import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';

import { GradientView } from './GradientView';
import { glowShadow } from '@/lib/gradients';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';

interface Props extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  left?: React.ReactNode;
}

const textColor: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-secondary-foreground',
  ghost: 'text-foreground',
  outline: 'text-foreground',
  destructive: 'text-white',
};

export function Button({
  title,
  variant = 'primary',
  loading,
  fullWidth = true,
  left,
  disabled,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  const inner = (
    <View className="flex-row items-center justify-center gap-2">
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? '#fff' : undefined} />
      ) : (
        left
      )}
      <Text className={cn('text-base font-semibold', textColor[variant])}>{title}</Text>
    </View>
  );

  if (variant === 'primary') {
    return (
      <Pressable
        disabled={isDisabled}
        className={cn('active:opacity-90', fullWidth && 'self-stretch', isDisabled && 'opacity-50')}
        {...rest}>
        <GradientView
          name="primary"
          style={[
            { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20 },
            glowShadow.primary,
          ]}>
          {inner}
        </GradientView>
      </Pressable>
    );
  }

  const base =
    variant === 'secondary'
      ? 'bg-secondary'
      : variant === 'destructive'
        ? 'bg-destructive'
        : variant === 'outline'
          ? 'border border-border bg-transparent'
          : 'bg-transparent';

  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        'items-center justify-center rounded-xl px-5 py-3.5 active:opacity-80',
        base,
        fullWidth && 'self-stretch',
        isDisabled && 'opacity-50',
      )}
      {...rest}>
      {inner}
    </Pressable>
  );
}
