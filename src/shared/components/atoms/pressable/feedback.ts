import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import type { FeedbackConfig } from './types';

async function triggerHaptic(type: NonNullable<FeedbackConfig['hapticType']>) {
  if (Platform.OS === 'android') {
    const effects = {
      light: Haptics.AndroidHaptics.Context_Click,
      soft: Haptics.AndroidHaptics.Context_Click,
      medium: Haptics.AndroidHaptics.Virtual_Key,
      rigid: Haptics.AndroidHaptics.Virtual_Key,
      heavy: Haptics.AndroidHaptics.Long_Press,
      selection: Haptics.AndroidHaptics.Segment_Tick,
      success: Haptics.AndroidHaptics.Confirm,
      warning: Haptics.AndroidHaptics.Reject,
      error: Haptics.AndroidHaptics.Reject,
    };
    await Haptics.performAndroidHapticsAsync(effects[type]);
  } else if (type === 'selection') {
    await Haptics.selectionAsync();
  } else if (type === 'success' || type === 'warning' || type === 'error') {
    const notifications = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error,
    };
    await Haptics.notificationAsync(notifications[type]);
  } else {
    const impacts = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
      soft: Haptics.ImpactFeedbackStyle.Soft,
      rigid: Haptics.ImpactFeedbackStyle.Rigid,
    };
    await Haptics.impactAsync(impacts[type]);
  }
}

export function triggerFeedback(feedback: FeedbackConfig) {
  if (feedback.haptic) {
    // Optional hardware feedback must never delay or prevent the action.
    void triggerHaptic(feedback.hapticType ?? 'light').catch(() => {
      if (__DEV__) console.warn('Kodaily: feedback tátil indisponível neste dispositivo.');
    });
  }
  if (feedback.sound) feedback.onSound?.();
}
