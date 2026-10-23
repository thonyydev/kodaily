import type { PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizes, spacing } from '@/shared/theme';

export function AppScreen({
  children,
  outsideTabs = false,
}: PropsWithChildren<{ outsideTabs?: boolean }>) {
  const insets = useSafeAreaInsets();
  // iOS native tabs adjust the ScrollView; Android's navigator owns its bottom inset.
  const automaticInsets = Platform.OS === 'ios' && !outsideTabs;

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior={automaticInsets ? 'automatic' : 'never'}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: automaticInsets ? 0 : insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: outsideTabs ? insets.bottom : 0,
        },
      ]}>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  content: {
    width: '100%',
    maxWidth: sizes.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
});
