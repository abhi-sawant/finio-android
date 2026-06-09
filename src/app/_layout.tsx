import '@/lib/intl-polyfill';
import '@/global.css';

import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeController } from '@/components/ThemeController';
import { HydrationGate } from '@/components/HydrationGate';
import { useFinanceStore } from '@/store/useFinanceStore';
import { autoBackupIfNeeded, autoLocalBackupIfNeeded } from '@/services/backup';

function useAppLifecycle() {
  useEffect(() => {
    const run = () => {
      // Generate any due recurring transactions, then attempt backups.
      useFinanceStore.getState().processRecurring();
      void autoBackupIfNeeded();
      void autoLocalBackupIfNeeded();
    };

    // Run once after hydration completes (AsyncStorage rehydration is async).
    const unsub = useFinanceStore.subscribe((s, prev) => {
      if (s.isHydrated && !prev.isHydrated) run();
    });
    if (useFinanceStore.getState().isHydrated) run();

    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') {
        void autoBackupIfNeeded();
        void autoLocalBackupIfNeeded();
      }
    });

    return () => {
      unsub();
      sub.remove();
    };
  }, []);
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  useAppLifecycle();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeController />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <HydrationGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
              <Stack.Screen name="edit-transaction/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="add-account" options={{ presentation: 'modal' }} />
              <Stack.Screen name="edit-account/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="manage-categories" />
              <Stack.Screen name="manage-labels" />
              <Stack.Screen name="budgets" />
              <Stack.Screen name="recurring" />
            </Stack>
          </HydrationGate>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
