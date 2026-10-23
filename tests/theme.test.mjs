import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// Load the pure tokens without React Native or changing the app's module format.
const source = readFileSync(
  new URL('../src/shared/theme/tokens.ts', import.meta.url),
  'utf8',
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
});
const { colors, sizes } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('Minimal Terminal text and semantic colors meet WCAG AA on content surfaces', () => {
  for (const foreground of [
    'text',
    'textMuted',
    'accent',
    'success',
    'warning',
    'danger',
  ]) {
    for (const background of [
      'background',
      'surface',
      'surfaceElevated',
      'accentSubtle',
      'pressed',
    ]) {
      assert.ok(
        contrast(colors[foreground], colors[background]) >= 4.5,
        `${foreground} on ${background}`,
      );
    }
  }
});

test('button labels and keyboard focus keep sufficient contrast in interactive states', () => {
  for (const background of ['accent', 'accentPressed']) {
    assert.ok(
      contrast(colors.onAccent, colors[background]) >= 4.5,
      `button label on ${background}`,
    );
  }
  assert.ok(contrast(colors.focus, colors.surfaceElevated) >= 3);
  assert.ok(sizes.touchTarget >= 44);
});
