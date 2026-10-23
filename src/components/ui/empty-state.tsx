import { View, StyleSheet } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { spacing } from '@/shared/theme';

type EmptyStateProps = {
  title: string;
  description: string;
} & (
  | { icon: AppIconName; identifier?: never }
  | { identifier: string; icon?: never }
);

export function EmptyState({
  icon,
  identifier,
  title,
  description,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {identifier !== undefined ? (
        <AppText variant="mono" color="textMuted">
          {identifier}
        </AppText>
      ) : (
        <AppIcon name={icon} color="textMuted" />
      )}
      <AppText variant="label" accessibilityRole="header">
        {title}
      </AppText>
      <AppText color="textMuted">{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, paddingVertical: spacing.lg },
});
