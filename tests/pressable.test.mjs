import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const componentDirectory = new URL('../src/shared/components/atoms/pressable/', import.meta.url);
function load(file, modules) {
  const source = readFileSync(new URL(file, componentDirectory), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const module = { exports: {} };
  new Function('require', 'exports', 'module', '__DEV__', outputText)(
    (id) => modules[id] ?? require(id), module.exports, module, false,
  );
  return module.exports;
}

// Exercise contracts with native/animation substitutes; physical feel is checked on device.
function setup({ reducedMotion = false, context = {}, platform = 'ios', failHaptics = false } = {}) {
  const values = [];
  const timings = [];
  const haptics = [];
  let effects = [];
  let cursor = 0;
  const modules = {
    react: {
      ...require('react'),
      useEffect: (callback) => { effects.push(callback); },
      useRef: () => ({ current: null }),
      useMemo: (callback) => callback(),
    },
    'react-native': {
      Platform: { OS: platform }, Pressable: 'NativePressable', View: 'View',
      StyleSheet: {
        create: (styles) => styles,
        flatten: (styles) => Array.isArray(styles)
          ? Object.assign({}, ...styles.filter(Boolean)) : styles,
        absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
      },
    },
    'expo-blur': { BlurView: 'BlurView', BlurTargetView: 'BlurTargetView' },
    'react-native-reanimated': {
      __esModule: true,
      default: { View: 'AnimatedView', createAnimatedComponent: (component) => component },
      ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
      Extrapolation: { CLAMP: 'clamp' },
      interpolate: (value, input, output) => output[0]
        + Math.max(0, Math.min(1, value)) * (output[1] - output[0]),
      useSharedValue: (initial) => {
        const index = cursor++;
        return values[index] ??= {
          value: initial, get() { return this.value; }, set(value) { this.value = value; },
        };
      },
      useReducedMotion: () => reducedMotion,
      useAnimatedStyle: (callback) => callback,
      useAnimatedProps: (callback) => callback,
      withTiming: (value, config) => { timings.push({ kind: 'timing', value, ...config }); return value; },
      withSpring: (value, config) => { timings.push({ kind: 'spring', value, ...config }); return value; },
    },
    '@/shared/theme/tokens': {
      motion: { pressScale: 0.98, pressDuration: 100, longPressScale: 0.96,
        longPressDuration: 500, spring: { damping: 26, stiffness: 360, mass: 0.7 } },
      effects: { buttonBlur: { intensity: 12, pressedIntensity: 20 } },
    },
    './context': { usePressableContext: () => context },
    'expo-haptics': Object.fromEntries([
      ['ImpactFeedbackStyle', { Light: 'light', Medium: 'medium', Heavy: 'heavy', Soft: 'soft', Rigid: 'rigid' }],
      ['NotificationFeedbackType', { Success: 'success', Warning: 'warning', Error: 'error' }],
      ['AndroidHaptics', { Context_Click: 'context-click', Segment_Tick: 'segment-tick',
        Virtual_Key: 'virtual-key', Long_Press: 'long-press', Confirm: 'confirm', Reject: 'reject' }],
      ...['impactAsync', 'notificationAsync', 'selectionAsync', 'performAndroidHapticsAsync'].map((method) => [
        method, async (value) => {
          haptics.push([method, value]);
          if (failHaptics) throw new Error('Hardware unavailable');
        },
      ]),
    ]),
  };
  modules['./feedback'] = load('feedback.ts', modules);
  const { Pressable } = load('index.tsx', modules);
  return {
    values, timings, haptics,
    render: (props = {}) => { cursor = 0; effects = []; return Pressable(props).props; },
    flushEffects: () => effects.forEach((effect) => effect()),
  };
}

function content(props) { return props.children({ pressed: true }).props.children[1]; }

test('press feedback preserves native props, state styles, children and callbacks', () => {
  const harness = setup();
  const events = [];
  const event = { nativeEvent: {} };
  const style = ({ pressed }) => ({ opacity: pressed ? 0.8 : 1 });
  const onPress = () => events.push('press');
  const props = harness.render({
    style, onPress, 'aria-busy': true, accessibilityLabel: 'Voltar',
    onPressIn: (received) => { assert.equal(received, event); events.push('in'); },
    onPressOut: (received) => { assert.equal(received, event); events.push('out'); },
    children: ({ pressed }) => pressed ? 'pressed' : 'rest',
  });
  assert.equal(props.style, style);
  assert.equal(props['aria-busy'], true);
  assert.equal(props.accessibilityLabel, 'Voltar');
  assert.equal(content(props).props.children, 'pressed');
  props.onPressIn(event);
  assert.equal(content(props).props.style[1]().transform[0].scale, 0.98);
  props.onPress(event);
  props.onPressOut(event);
  assert.equal(content(props).props.style[1]().transform[0].scale, 1);
  assert.deepEqual(events, ['in', 'press', 'out']);
  assert.ok(harness.timings.every((timing) => timing.reduceMotion === 'system'));
});

test('disabling a pressed control resets feedback and blocks callbacks/haptics', () => {
  const harness = setup({ context: { defaultFeedback: { haptic: true } } });
  harness.render().onPressIn({});
  const disabled = harness.render({ disabled: true, onPress: assert.fail, onPressIn: assert.fail });
  harness.flushEffects();
  assert.equal(content(disabled).props.style[1]().transform[0].scale, 1);
  assert.equal(disabled.disabled, true);
  disabled.onPressIn({}); disabled.onPress({});
  assert.equal(harness.haptics.length, 1);
});

test('reduced motion bypasses custom motion while preserving actions and haptics', () => {
  const harness = setup({ reducedMotion: true });
  let presses = 0;
  const props = harness.render({ customAnimation: assert.fail,
    feedback: { haptic: true }, onPress: () => { presses += 1; } });
  props.onPressIn({}); props.onPress({});
  assert.equal(content(props).props.style[1]().transform[0].scale, 1);
  assert.equal(harness.timings.length, 0);
  assert.equal(harness.haptics.length, 1);
  assert.equal(presses, 1);
});

test('provider defaults, per-control overrides, sound and global callback remain available', () => {
  let globalPresses = 0;
  let sounds = 0;
  const harness = setup({ context: {
    initialOnPress: () => { globalPresses += 1; },
    defaultPressAnimation: { useSpring: true, scale: 0.97 },
    defaultFeedback: { haptic: true, hapticType: 'soft' },
  } });
  const props = harness.render({ pressAnimation: { scale: 0.99 },
    feedback: { sound: true, onSound: () => { sounds += 1; } } });
  props.onPressIn({});
  assert.equal(content(props).props.style[1]().transform[0].scale, 0.99);
  assert.equal(harness.timings[0].kind, 'spring');
  assert.deepEqual(harness.haptics[0], ['impactAsync', 'soft']);
  assert.equal(globalPresses, 1); assert.equal(sounds, 1);
  harness.render({ skipGlobalCallback: true, feedback: { haptic: false } }).onPressIn({});
  assert.equal(globalPresses, 1); assert.equal(harness.haptics.length, 1);
});

test('live provider preference overrides the static startup motion preference', () => {
  const harness = setup({ reducedMotion: true, context: {
    reducedMotion: false, defaultPressAnimation: { useSpring: true },
  } });
  const props = harness.render();
  props.onPressIn({});
  assert.equal(content(props).props.style[1]().transform[0].scale, 0.98);
  assert.equal(harness.timings[0].reduceMotion, 'never');
});

test('long press uses the native gesture callback and retains configurable animation', () => {
  const harness = setup();
  let calls = 0;
  const props = harness.render({ longPressDuration: 650, onLongPress: () => { calls += 1; },
    longPressAnimation: { scale: 0.94, rotate: 2, translateX: 1, translateY: 3, opacity: 0.9 } });
  assert.equal(props.delayLongPress, 650);
  props.onPressIn({}); props.onLongPress({});
  assert.equal(calls, 1);
  const animated = content(props).props.style[1]();
  assert.deepEqual(animated.transform, [{ scale: 0.94 }, { rotate: '2deg' }, { translateX: 1 }, { translateY: 3 }]);
  assert.equal(animated.opacity, 0.9);
  props.onPressOut({});
  assert.equal(content(props).props.style[1]().transform[0].scale, 1);
  assert.equal(harness.render().onLongPress, undefined);
});

test('blur stays below content, animates intensity and honors reduced transparency', () => {
  const harness = setup();
  const props = harness.render({ blur: { enabled: true, animateOnPress: true },
    style: { borderRadius: 6 }, children: 'Legível' });
  const [layer, foreground] = props.children({ pressed: true }).props.children;
  assert.equal(layer.props['aria-hidden'], true);
  assert.equal(layer.props.pointerEvents, 'none');
  assert.equal(foreground.props.children, 'Legível');
  const blur = layer.props.children[1];
  assert.equal(blur.props.animatedProps().intensity, 12);
  props.onPressIn({});
  assert.equal(blur.props.animatedProps().intensity, 20);
  const reduced = setup({ context: { reducedTransparency: true } });
  assert.equal(reduced.render({ blur: { enabled: true } }).children({}).props.children[0], false);
});

test('Android configures a real blur target and native haptics', () => {
  const harness = setup({ platform: 'android' });
  const props = harness.render({ blur: { enabled: true }, feedback: { haptic: true, hapticType: 'selection' } });
  const layer = props.children({}).props.children[0];
  const [target, blur] = layer.props.children;
  assert.equal(target.type, 'BlurTargetView');
  assert.equal(blur.props.blurTarget, target.props.ref);
  assert.equal(blur.props.blurMethod, 'dimezisBlurViewSdk31Plus');
  props.onPressIn({});
  assert.deepEqual(harness.haptics[0], ['performAndroidHapticsAsync', 'segment-tick']);
});

test('optional haptic failure never rejects or prevents the action', async () => {
  const harness = setup({ failHaptics: true });
  let calls = 0;
  const props = harness.render({ feedback: { haptic: true }, onPress: () => { calls += 1; } });
  props.onPressIn({}); props.onPress({});
  await new Promise(setImmediate);
  assert.equal(calls, 1);
});

test('provider observes live accessibility preferences and removes subscriptions', async () => {
  const state = [];
  const listeners = {};
  const removed = [];
  let cursor = 0;
  let mount;
  const { PressableProvider } = load('context.tsx', {
    react: {
      ...require('react'),
      useState: (initial) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => { state[index] = value; }];
      },
      useMemo: (callback) => callback(),
      useEffect: (callback) => { mount = callback; },
    },
    'react-native': {
      Platform: { OS: 'ios' },
      AccessibilityInfo: {
        isReduceMotionEnabled: async () => true,
        isReduceTransparencyEnabled: async () => true,
        addEventListener: (event, callback) => {
          listeners[event] = callback;
          return { remove: () => { removed.push(event); } };
        },
      },
    },
    'react-native-reanimated': { useReducedMotion: () => false },
  });
  function render() {
    cursor = 0;
    return PressableProvider({ children: 'App', defaultFeedback: { haptic: true } }).props;
  }
  assert.equal(render().children, 'App');
  const cleanup = mount();
  await new Promise(setImmediate);
  assert.equal(render().value.reducedMotion, true);
  assert.equal(render().value.reducedTransparency, true);
  listeners.reduceMotionChanged(false);
  listeners.reduceTransparencyChanged(false);
  assert.equal(render().value.reducedMotion, false);
  assert.equal(render().value.reducedTransparency, false);
  cleanup();
  assert.deepEqual(removed, ['reduceMotionChanged', 'reduceTransparencyChanged']);
});
