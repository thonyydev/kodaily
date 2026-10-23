// Adapted from Reacticx pressable (MIT); see LICENSE in this directory.
import { Children, isValidElement, useEffect, useMemo, useRef, type ComponentRef, type ReactNode } from 'react';
import {
  Platform, Pressable as RNPressable, StyleSheet, View,
  type GestureResponderEvent, type StyleProp, type ViewStyle,
} from 'react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import Animated, {
  Extrapolation, ReduceMotion, interpolate, useAnimatedProps,
  useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';

import { effects, motion } from '@/shared/theme/tokens';
import { usePressableContext } from './context';
import { triggerFeedback } from './feedback';
import type { AnimationConfig, PressableProps } from './types';

export { PressableProvider, usePressableContext } from './context';
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type RadiusStyle = Pick<ViewStyle, 'borderRadius' | 'borderTopLeftRadius'
  | 'borderTopRightRadius' | 'borderBottomLeftRadius' | 'borderBottomRightRadius'>;
function getRadius(style?: StyleProp<ViewStyle>): RadiusStyle {
  const flat = StyleSheet.flatten(style);
  return {
    borderRadius: flat?.borderRadius,
    borderTopLeftRadius: flat?.borderTopLeftRadius,
    borderTopRightRadius: flat?.borderTopRightRadius,
    borderBottomLeftRadius: flat?.borderBottomLeftRadius,
    borderBottomRightRadius: flat?.borderBottomRightRadius,
  };
}

function getChildRadius(children: ReactNode): RadiusStyle | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ style?: StyleProp<ViewStyle>; children?: ReactNode }>(child)) continue;
    const radius = getRadius(child.props.style);
    if (Object.values(radius).some((value) => value !== undefined)) return radius;
    const nestedRadius = getChildRadius(child.props.children);
    if (nestedRadius) return nestedRadius;
  }
}

export function Pressable({
  children, contentStyle, style, disabled = false,
  onPress, onLongPress, onPressIn, onPressOut,
  longPressDuration, delayLongPress, pressAnimation, longPressAnimation,
  customAnimation, feedback, blur, disableAnimations = false,
  skipGlobalCallback = false, accessibilityRole = 'button', ...props
}: PressableProps) {
  const context = usePressableContext();
  const reducedMotion = useReducedMotion();
  const animationsDisabled = !!(disableAnimations || context.disableAnimations
    || (context.reducedMotion ?? reducedMotion));
  // The provider tracks live settings; Reanimated's hook only reads the startup value.
  const motionPolicy = context.reducedMotion === undefined ? ReduceMotion.System
    : context.reducedMotion ? ReduceMotion.Always : ReduceMotion.Never;
  const isPressed = useSharedValue(false);
  const isLongPressed = useSharedValue(false);
  const progress = useSharedValue(0);
  const longPressProgress = useSharedValue(0);
  const blurTarget = useRef<ComponentRef<typeof View> | null>(null);

  const finalPressAnimation = useMemo(() => ({
    scale: motion.pressScale, opacity: 1, rotate: 0, translateX: 0, translateY: 0,
    duration: motion.pressDuration, useSpring: false, ...motion.spring,
    ...context.defaultPressAnimation, ...pressAnimation,
  }), [context.defaultPressAnimation, pressAnimation]);
  const finalLongPressAnimation = useMemo(() => ({
    ...finalPressAnimation, scale: motion.longPressScale, useSpring: true,
    ...context.defaultLongPressAnimation, ...longPressAnimation,
  }), [finalPressAnimation, context.defaultLongPressAnimation, longPressAnimation]);
  const finalFeedback = { ...context.defaultFeedback, ...feedback };
  const finalBlur = {
    enabled: false, ...effects.buttonBlur, tint: 'default' as const,
    animateOnPress: false, ...context.defaultBlur, ...blur,
  };
  const { animateOnPress, intensity, pressedIntensity } = finalBlur;
  const blurEnabled = finalBlur.enabled && !disabled && !context.reducedTransparency;
  const childRadius = typeof children === 'function' ? undefined : getChildRadius(children);

  useEffect(() => {
    if (disabled || animationsDisabled) {
      progress.set(0);
      longPressProgress.set(0);
      isPressed.set(false);
      isLongPressed.set(false);
    }
  }, [disabled, animationsDisabled, progress, longPressProgress, isPressed, isLongPressed]);

  function animateValue(value: number, config: AnimationConfig) {
    if (disabled || animationsDisabled) return 0;
    if (config.useSpring) {
      return withSpring(value, {
        damping: config.damping, stiffness: config.stiffness, mass: config.mass,
        reduceMotion: motionPolicy,
      });
    }
    return withTiming(value, { duration: config.duration, reduceMotion: motionPolicy });
  }

  function handlePressIn(event: GestureResponderEvent) {
    if (disabled) return;
    isPressed.set(true);
    progress.set(animateValue(1, finalPressAnimation));
    triggerFeedback(finalFeedback);
    if (!skipGlobalCallback) context.initialOnPress?.(event);
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    isPressed.set(false);
    isLongPressed.set(false);
    progress.set(animateValue(0, finalPressAnimation));
    longPressProgress.set(animateValue(0, finalLongPressAnimation));
    onPressOut?.(event);
  }

  function handleLongPress(event: GestureResponderEvent) {
    if (disabled) return;
    isLongPressed.set(true);
    longPressProgress.set(animateValue(1, finalLongPressAnimation));
    onLongPress?.(event);
  }

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    if (disabled || animationsDisabled) return { transform: [{ scale: 1 }], opacity: 1 };
    if (customAnimation) return customAnimation(progress, isPressed);
    const activeAnimation = isLongPressed.get() ? finalLongPressAnimation : finalPressAnimation;
    const activeProgress = isLongPressed.get() ? longPressProgress.get() : progress.get();
    return {
      transform: [
        { scale: interpolate(activeProgress, [0, 1], [1, activeAnimation.scale]) },
        { rotate: `${interpolate(activeProgress, [0, 1], [0, activeAnimation.rotate])}deg` },
        { translateX: interpolate(activeProgress, [0, 1], [0, activeAnimation.translateX]) },
        { translateY: interpolate(activeProgress, [0, 1], [0, activeAnimation.translateY]) },
      ],
      opacity: interpolate(activeProgress, [0, 1], [1, activeAnimation.opacity]),
    };
  });

  function getBlurIntensity() {
    'worklet';
    return animateOnPress && !animationsDisabled
      ? interpolate(progress.get(), [0, 1],
        [intensity, pressedIntensity], Extrapolation.CLAMP)
      : intensity;
  }
  const animatedBlurProps = useAnimatedProps(() => ({ intensity: getBlurIntensity() }));
  // Expo BlurView's Web adapter reads animated intensity from style.intensity.
  const animatedBlurStyle = useAnimatedStyle<ViewStyle & { intensity: number }>(
    () => ({ intensity: getBlurIntensity() }),
  );

  return (
    <RNPressable
      {...props}
      style={style}
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      delayLongPress={longPressDuration ?? delayLongPress
        ?? context.defaultLongPressDuration ?? motion.longPressDuration}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress ? handleLongPress : undefined}
      onPress={(event) => { if (!disabled) onPress?.(event); }}>
      {(state) => {
        const resolvedStyle = StyleSheet.flatten(typeof style === 'function' ? style(state) : style);
        const radius = Object.fromEntries(Object.entries(getRadius(resolvedStyle))
          .filter(([, value]) => value !== undefined));
        return (
          <>
            {blurEnabled && (
              <View pointerEvents="none" aria-hidden
                style={[StyleSheet.absoluteFill, childRadius, radius, styles.blurClip]}>
                {Platform.OS === 'android' && !finalBlur.blurTarget && (
                  <BlurTargetView ref={blurTarget}
                    style={[StyleSheet.absoluteFill, { backgroundColor: resolvedStyle?.backgroundColor }]} />
                )}
                <AnimatedBlurView
                  intensity={finalBlur.intensity}
                  animatedProps={Platform.OS === 'web' ? undefined : animatedBlurProps}
                  tint={finalBlur.tint}
                  blurTarget={Platform.OS === 'android' ? finalBlur.blurTarget ?? blurTarget : undefined}
                  blurMethod={Platform.OS === 'android'
                    ? finalBlur.blurMethod ?? 'dimezisBlurViewSdk31Plus' : undefined}
                  blurReductionFactor={finalBlur.blurReductionFactor}
                  style={[StyleSheet.absoluteFill,
                    Platform.OS === 'web' && animatedBlurStyle]}
                />
              </View>
            )}
            {/* Keep touch bounds/focus stable and render readable content above the blur. */}
            <Animated.View style={[contentStyle, animatedStyle]}>
              {typeof children === 'function' ? children(state) : children}
            </Animated.View>
          </>
        );
      }}
    </RNPressable>
  );
}

const styles = StyleSheet.create({ blurClip: { overflow: 'hidden' } });
