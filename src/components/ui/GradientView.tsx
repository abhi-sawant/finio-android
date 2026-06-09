import { LinearGradient, type LinearGradientPoint } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { getGradient, type GradientName } from '@/lib/gradients';

type Props = PropsWithChildren<{
  name?: GradientName;
  style?: StyleProp<ViewStyle>;
  start?: LinearGradientPoint;
  end?: LinearGradientPoint;
}>;

export function GradientView({
  name = 'primary',
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  children,
}: Props) {
  const { colorScheme } = useColorScheme();
  const colors = getGradient(name, colorScheme) as [string, string, ...string[]];

  return (
    <LinearGradient colors={colors} start={start} end={end} style={style}>
      {children}
    </LinearGradient>
  );
}
