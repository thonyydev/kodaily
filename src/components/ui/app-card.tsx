import { View, StyleSheet, type ViewProps } from 'react-native';

import { colors, radii, sizes, spacing } from '@/shared/theme';

export function AppCard({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: sizes.border,
    borderColor: colors.divider,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
