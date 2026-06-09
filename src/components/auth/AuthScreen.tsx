import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/layout/Header';

/** Shared centered, keyboard-aware wrapper for the auth screens. */
export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Header title="" back />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled">
          <View className="mx-auto w-full max-w-sm gap-4">
            <View className="mb-4 items-center">
              {typeof title === 'string' ? (
                <Text className="text-2xl font-bold text-foreground">{title}</Text>
              ) : (
                title
              )}
              {subtitle ? <Text className="mt-2 text-center text-muted-foreground">{subtitle}</Text> : null}
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
