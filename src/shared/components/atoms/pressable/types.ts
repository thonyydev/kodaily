import type { ReactNode } from 'react';
import type { BlurViewProps } from 'expo-blur';
import type {
  PressableProps as NativePressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export interface AnimationConfig {
  readonly scale?: number;
  readonly rotate?: number;
  readonly opacity?: number;
  readonly translateX?: number;
  readonly translateY?: number;
  readonly duration?: number;
  readonly useSpring?: boolean;
  readonly damping?: number;
  readonly stiffness?: number;
  readonly mass?: number;
}

// Custom animations run on the UI thread and must be worklets.
export type CustomAnimation = (
  progress: SharedValue<number>,
  isPressed: SharedValue<boolean>,
) => ViewStyle;

export interface BlurConfig extends Pick<
  BlurViewProps, 'tint' | 'blurTarget' | 'blurMethod' | 'blurReductionFactor'
> {
  enabled: boolean;
  intensity?: number;
  animateOnPress?: boolean;
  pressedIntensity?: number;
}

export interface FeedbackConfig {
  haptic?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid'
    | 'selection' | 'success' | 'warning' | 'error';
  sound?: boolean;
  onSound?: () => void;
}

export interface PressableProviderProps {
  children: ReactNode;
  initialOnPress?: (event: GestureResponderEvent) => void;
  defaultPressAnimation?: AnimationConfig;
  defaultLongPressAnimation?: AnimationConfig;
  defaultFeedback?: FeedbackConfig;
  defaultBlur?: BlurConfig;
  disableAnimations?: boolean;
  defaultLongPressDuration?: number;
}

export type PressableContextType = Omit<PressableProviderProps, 'children'> & {
  reducedMotion?: boolean;
  reducedTransparency?: boolean;
};

export type PressableProps = NativePressableProps & {
  contentStyle?: StyleProp<ViewStyle>;
  longPressDuration?: number;
  pressAnimation?: AnimationConfig;
  longPressAnimation?: AnimationConfig;
  customAnimation?: CustomAnimation;
  feedback?: FeedbackConfig;
  blur?: BlurConfig;
  disableAnimations?: boolean;
  skipGlobalCallback?: boolean;
};
