import type { TextStyle } from 'react-native';

// Semantic roles keep a future palette independent of component styles.
export const colors = {
  background: '#0C1116',
  surface: '#131C23',
  surfaceElevated: '#1C2831',
  border: '#2B3B45',
  divider: '#22313A',
  text: '#E8EFF2',
  textMuted: '#A0B2BC',
  textDisabled: '#758892',
  accent: '#81C8D0',
  accentPressed: '#69B1BA',
  accentSubtle: '#193239',
  onAccent: '#0C1116',
  success: '#A3CFA5',
  warning: '#E6C185',
  danger: '#EC9B9B',
  pressed: '#293F49',
  focus: '#B3E4E8',
} as const;

export type ThemeColor = keyof typeof colors;
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;
export const radii = { sm: 4, md: 6, lg: 10, pill: 999 } as const;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  body: { fontSize: 16, lineHeight: 25, fontWeight: '400' },
  label: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
  mono: {
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
} as const satisfies Record<string, TextStyle>;

export const sizes = {
  contentMaxWidth: 720,
  touchTarget: 48,
  iconSmall: 20,
  icon: 24,
  border: 1,
  focusRing: 2,
  focusOffset: 4,
} as const;

export const shadows = {
  none: 'none',
  floating: '0 6px 18px rgba(0, 0, 0, 0.14)',
} as const;
