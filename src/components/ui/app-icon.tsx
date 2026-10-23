import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { colors, sizes, type ThemeColor } from '@/shared/theme';

const icons = {
  terminal: {
    ios: 'chevron.left.forwardslash.chevron.right',
    android: 'code',
    web: 'code',
  },
  folder: { ios: 'folder', android: 'folder', web: 'folder' },
  history: {
    ios: 'clock.arrow.circlepath',
    android: 'history',
    web: 'history',
  },
  person: {
    ios: 'person.crop.circle',
    android: 'account_circle',
    web: 'account_circle',
  },
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  home: { ios: 'house', android: 'home', web: 'home' },
  back: { ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' },
} as const satisfies Record<string, SymbolViewProps['name']>;

export type AppIconName = keyof typeof icons;

export function AppIcon({
  name,
  color = 'textMuted',
  size = sizes.icon,
}: {
  name: AppIconName;
  color?: ThemeColor;
  size?: number;
}) {
  return (
    <SymbolView
      name={icons[name]}
      size={size}
      tintColor={colors[color]}
      aria-hidden
    />
  );
}
