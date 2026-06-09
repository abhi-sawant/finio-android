// Imperative color palette mirroring the NativeWind CSS variables in global.css.
// Use these where Tailwind classes can't reach: charts (Skia), SVG icons,
// navigation themes, status bar.

export interface Palette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  warning: string;
}

export const palette: Record<'light' | 'dark', Palette> = {
  light: {
    background: '#f8f8f8',
    foreground: '#0a0a0a',
    card: '#ffffff',
    cardForeground: '#0a0a0a',
    primary: '#1447e6',
    primaryForeground: '#fafafa',
    secondary: '#f5f5f5',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
    accent: '#f5f5f5',
    destructive: '#e7000b',
    border: '#e5e5e5',
    input: '#e5e5e5',
    ring: '#1447e6',
    success: '#16c47f',
    warning: '#f59e0b',
  },
  dark: {
    background: '#0c0d12',
    foreground: '#fafafa',
    card: '#14161b',
    cardForeground: '#fafafa',
    primary: '#3366e4',
    primaryForeground: '#fafafa',
    secondary: '#262626',
    muted: '#252629',
    mutedForeground: '#8f8f8f',
    accent: '#252629',
    destructive: '#ff6467',
    border: '#26282e',
    input: '#2a2b30',
    ring: '#3366e4',
    success: '#22c55e',
    warning: '#f59e0b',
  },
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;
