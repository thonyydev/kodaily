import {
  TabList,
  TabSlot,
  Tabs,
  TabTrigger,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { useState, type AriaAttributes, type ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { colors, radii, sizes, spacing } from '@/shared/theme';

export default function AppTabs() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.slot} />
      <TabList
        role="navigation"
        accessibilityLabel="Navegação principal"
        style={styles.tabList}>
        <TabTrigger name="today" href="/" asChild>
          <TabButton icon="home">Hoje</TabButton>
        </TabTrigger>
        <TabTrigger name="projects" href="/projects" asChild>
          <TabButton icon="folder">Projetos</TabButton>
        </TabTrigger>
        <TabTrigger name="history" href="/history" asChild>
          <TabButton icon="history">Histórico</TabButton>
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton icon="person">Perfil</TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

// Router 58 supplies a View ref; Pressable requires its own instance type in RN 0.88.
type TabButtonProps = Omit<TabTriggerSlotProps, 'ref'> &
  Pick<ComponentProps<typeof Pressable>, 'ref'> & { icon: AppIconName };

function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  const [focused, setFocused] = useState(false);
  const currentPageProps: Pick<AriaAttributes, 'aria-current'> = {
    'aria-current': isFocused ? 'page' : undefined,
  };
  return (
    <Pressable
      {...props}
      {...currentPageProps}
      accessibilityRole="link"
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      style={({ pressed }) => [
        styles.tab,
        isFocused && styles.selected,
        pressed && styles.pressed,
        focused && styles.focused,
      ]}>
      <AppIcon
        name={icon}
        color={isFocused ? 'accent' : 'textMuted'}
        size={sizes.iconSmall}
      />
      <AppText
        variant="caption"
        color={isFocused ? 'accent' : 'textMuted'}
        style={styles.label}>
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1, backgroundColor: colors.background },
  slot: { flex: 1 },
  tabList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.xs,
    gap: spacing.xxs,
    backgroundColor: colors.surface,
    borderTopWidth: sizes.border,
    borderColor: colors.border,
  },
  tab: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xxs,
    gap: spacing.xxs,
    borderRadius: radii.sm,
  },
  selected: { backgroundColor: colors.accentSubtle },
  pressed: { backgroundColor: colors.pressed },
  focused: {
    outlineColor: colors.focus,
    outlineWidth: sizes.focusRing,
    outlineStyle: 'solid',
    outlineOffset: -sizes.focusRing,
  },
  label: { textAlign: 'center' },
});
