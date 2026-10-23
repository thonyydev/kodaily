import { View, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { spacing } from '@/shared/theme';

export function ScreenHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.header}>
      {eyebrow && (
        <AppText variant="mono" color="textMuted">
          {eyebrow}
        </AppText>
      )}
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      {description && <AppText color="textMuted">{description}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
});
