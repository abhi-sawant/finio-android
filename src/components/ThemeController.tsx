import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { useSettings } from '@/store/useFinanceStore';

/** Syncs the user's Settings.theme preference into NativeWind's color scheme. */
export function ThemeController() {
  const { setColorScheme } = useColorScheme();
  const theme = useSettings().theme;

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  return null;
}
