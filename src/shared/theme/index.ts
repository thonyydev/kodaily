import { DarkTheme } from 'expo-router';

import { colors } from './tokens';

export { colors, effects, motion, radii, shadows, sizes, spacing, typography } from './tokens';
export type { ThemeColor } from './tokens';
export { fonts } from './fonts';

export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};
