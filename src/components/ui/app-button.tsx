import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
} from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Pressable } from '@/shared/components/atoms/pressable';
import { colors, radii, sizes, spacing } from '@/shared/theme';

type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  icon?: AppIconName;
};

export function AppButton({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  ...props
}: AppButtonProps) {
  const [focused, setFocused] = useState(false);
  const unavailable = disabled || loading;
  const textColor = unavailable
    ? 'textDisabled'
    : variant === 'primary'
      ? 'onAccent'
      : 'text';

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      aria-disabled={!!unavailable}
      aria-busy={loading}
      disabled={unavailable}
      contentStyle={styles.content}
      blur={{ enabled: variant === 'secondary' }}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed &&
          (variant === 'primary'
            ? styles.primaryPressed
            : styles.secondaryPressed),
        unavailable && styles.disabled,
        focused && styles.focused,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors[textColor]} />
      ) : (
        icon && <AppIcon name={icon} color={textColor} size={sizes.iconSmall} />
      )}
      <AppText variant="label" color={textColor} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.touchTarget,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  primary: { backgroundColor: colors.accent },
  secondary: {
    backgroundColor: colors.surface,
  },
  primaryPressed: { backgroundColor: colors.accentPressed },
  secondaryPressed: { backgroundColor: colors.pressed },
  disabled: {
    backgroundColor: colors.surfaceElevated,
  },
  focused: {
    outlineColor: colors.focus,
    outlineWidth: sizes.focusRing,
    outlineStyle: 'solid',
    outlineOffset: sizes.focusOffset,
  },
  label: { flexShrink: 1, textAlign: 'center' },
});
