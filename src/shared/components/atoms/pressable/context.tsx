import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { PressableContextType, PressableProviderProps } from './types';

const PressableContext = createContext<PressableContextType>({});
export const usePressableContext = () => useContext(PressableContext);

export function PressableProvider({ children, ...defaults }: PressableProviderProps) {
  const initialReducedMotion = useReducedMotion();
  const [reducedMotion, setReducedMotion] = useState(initialReducedMotion);
  const [reducedTransparency, setReducedTransparency] = useState(false);

  useEffect(() => {
    let active = true;
    const motionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged', setReducedMotion,
    );
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReducedMotion(value);
    }).catch(() => { /* Keep Reanimated's initial preference if unavailable. */ });

    const transparencySubscription = Platform.OS === 'ios'
      ? AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReducedTransparency)
      : undefined;
    if (Platform.OS === 'ios') {
      void AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
        if (active) setReducedTransparency(value);
      }).catch(() => { /* Retain the opaque base surface on unsupported systems. */ });
    }
    return () => {
      active = false;
      motionSubscription.remove();
      transparencySubscription?.remove();
    };
  }, []);

  const {
    initialOnPress, defaultPressAnimation, defaultLongPressAnimation,
    defaultFeedback, defaultBlur, disableAnimations, defaultLongPressDuration,
  } = defaults;
  const value = useMemo(() => ({
    initialOnPress, defaultPressAnimation, defaultLongPressAnimation,
    defaultFeedback, defaultBlur, disableAnimations, defaultLongPressDuration,
    reducedMotion, reducedTransparency,
  }), [initialOnPress, defaultPressAnimation, defaultLongPressAnimation,
    defaultFeedback, defaultBlur, disableAnimations, defaultLongPressDuration,
    reducedMotion, reducedTransparency]);

  return <PressableContext.Provider value={value}>{children}</PressableContext.Provider>;
}
