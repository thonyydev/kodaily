import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PressableProvider } from '@/shared/components/atoms/pressable';
import { navigationTheme, colors, effects, motion } from '@/shared/theme';

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <PressableProvider
        defaultPressAnimation={{ useSpring: true, scale: motion.pressScale, ...motion.spring }}
        defaultFeedback={{ haptic: true, hapticType: 'soft' }}
        defaultBlur={{ enabled: false, tint: 'dark', animateOnPress: true, ...effects.buttonBlur }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Screen name="(app)" />
        </Stack>
      </PressableProvider>
    </ThemeProvider>
  );
}
