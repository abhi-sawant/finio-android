import { ChevronLeft } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useThemeColors } from '@/hooks/use-theme-colors';

type Props = {
  title: string;
  /** Show a back button (for stack/modal screens). */
  back?: boolean;
  /** Optional right-aligned action node. */
  right?: ReactNode;
  subtitle?: string;
};

export function Header({ title, back, right, subtitle }: Props) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-2 px-3 pb-2 pt-1">
      {back ? (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={10}
          className="-ml-1 h-9 w-9 items-center justify-center rounded-full active:bg-muted">
          <ChevronLeft size={24} color={colors.foreground} />
        </Pressable>
      ) : null}
      <View className="flex-1">
        <Text className="text-2xl font-bold tracking-tight text-foreground">{title}</Text>
        {subtitle ? <Text className="text-sm text-muted-foreground">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
