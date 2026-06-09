import { useColorScheme } from 'nativewind';
import { palette, type Palette } from '@/constants/theme';

/** Active imperative palette (for charts, SVG icons, nav themes, status bar). */
export function useThemeColors(): Palette {
  const { colorScheme } = useColorScheme();
  return palette[colorScheme === 'dark' ? 'dark' : 'light'];
}
