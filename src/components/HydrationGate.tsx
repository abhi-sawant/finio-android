import { type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeColors } from '@/hooks/use-theme-colors';

/**
 * Blocks first paint until both persisted stores have rehydrated from
 * AsyncStorage. Without this, the UI would flash default/empty data and a
 * pre-hydration write could double-apply a balance delta.
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  const isHydrated = useFinanceStore((s) => s.isHydrated);
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const colors = useThemeColors();

  if (!isHydrated || !isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
