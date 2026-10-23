import { Text, type TextProps } from 'react-native';

import { colors, fonts, typography, type ThemeColor } from '@/shared/theme';

type AppTextProps = TextProps & {
  variant?: keyof typeof typography;
  color?: ThemeColor;
};

export function AppText({
  variant = 'body',
  color = 'text',
  style,
  ...props
}: AppTextProps) {
  const fontFamily = variant === 'mono' ? fonts.mono : fonts.sans;
  return (
    <Text
      {...props}
      style={[typography[variant], { color: colors[color], fontFamily }, style]}
    />
  );
}
