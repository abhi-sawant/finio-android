import { type ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  /** When true, content scrolls; otherwise it's a plain flex container. */
  scroll?: boolean;
  /** Extra bottom padding (e.g. to clear the tab bar). */
  bottomInset?: number;
  contentClassName?: string;
} & Pick<ScrollViewProps, 'keyboardShouldPersistTaps'>;

/** Safe-area aware screen wrapper. Mirrors the web <Main> content area. */
export function ScreenContainer({
  children,
  scroll = true,
  bottomInset = 24,
  contentClassName = '',
  keyboardShouldPersistTaps = 'handled',
}: Props) {
  const insets = useSafeAreaInsets();

  if (!scroll) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + bottomInset }}
      showsVerticalScrollIndicator={false}>
      <View className={`gap-4 px-3 pt-2 ${contentClassName}`}>{children}</View>
    </ScrollView>
  );
}
