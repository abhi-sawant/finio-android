export type ColorScheme = 'light' | 'dark' | null | undefined;

export type GradientName =
  | 'primary'
  | 'primarySoft'
  | 'success'
  | 'successSoft'
  | 'danger'
  | 'dangerSoft'
  | 'info'
  | 'warning';

type GradientMap = Record<GradientName, string[]>;

// 135deg gradients → expo-linear-gradient start {0,0} end {1,1}
const light: GradientMap = {
  primary: ['#7c5cff', '#5b6cff', '#4f8dff'],
  primarySoft: ['rgba(124,92,255,0.14)', 'rgba(79,141,255,0.14)'],
  success: ['#16c47f', '#34d399'],
  successSoft: ['rgba(22,196,127,0.12)', 'rgba(52,211,153,0.12)'],
  danger: ['#ff5f7e', '#ef4444'],
  dangerSoft: ['rgba(255,95,126,0.12)', 'rgba(239,68,68,0.12)'],
  info: ['#3b82f6', '#06b6d4'],
  warning: ['#f59e0b', '#f97316'],
};

const dark: GradientMap = {
  primary: ['#8b6dff', '#6577ff', '#4f9bff'],
  primarySoft: ['rgba(139,109,255,0.22)', 'rgba(79,155,255,0.18)'],
  success: ['#22c55e', '#16c47f'],
  successSoft: ['rgba(34,197,94,0.18)', 'rgba(22,196,127,0.18)'],
  danger: ['#ff6b81', '#f43f5e'],
  dangerSoft: ['rgba(255,107,129,0.18)', 'rgba(244,63,94,0.18)'],
  info: ['#60a5fa', '#22d3ee'],
  warning: ['#f59e0b', '#fb923c'],
};

export function getGradient(name: GradientName, scheme: ColorScheme): string[] {
  return (scheme === 'dark' ? dark : light)[name];
}

/** Glow shadow presets (translated from the web box-shadow glow utilities). */
export const glowShadow = {
  primary: {
    shadowColor: '#7c5cff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  success: {
    shadowColor: '#16c47f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  danger: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;
