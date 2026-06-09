import { Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { navTabs } from './navItems';
import { GradientView } from '@/components/ui/GradientView';
import { glowShadow } from '@/lib/gradients';
import { useThemeColors } from '@/hooks/use-theme-colors';

/** Minimal shape of the navigation state we read from the tab bar props. */
type TabBarProps = { state: { index: number } };

export function TabBar({ state }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View
      className="flex-row items-center border-t border-border bg-card"
      style={{ paddingBottom: insets.bottom, paddingTop: 6 }}>
      {navTabs.map((tab, index) => {
        const isActive = state.index === index;
        const Icon = tab.icon;
        return (
          <Pressable
            key={tab.name}
            onPress={() => router.navigate(tab.href)}
            className="flex-1 items-center gap-1 py-1.5 active:opacity-70">
            <Icon
              size={22}
              color={isActive ? colors.primary : colors.mutedForeground}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text
              className="text-[10px] font-medium"
              style={{ color: isActive ? colors.primary : colors.mutedForeground }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}

      {/* Center floating action button overlaid above the bar */}
      <Pressable
        onPress={() => router.push('/add-transaction')}
        className="absolute self-center active:opacity-90"
        style={{ top: -24, left: 0, right: 0, alignItems: 'center' }}
        pointerEvents="box-none">
        <GradientView
          name="primary"
          style={[
            {
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
            },
            glowShadow.primary,
          ]}>
          <Plus size={26} color="#ffffff" strokeWidth={2.6} />
        </GradientView>
      </Pressable>
    </View>
  );
}
