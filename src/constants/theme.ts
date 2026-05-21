/**
 * App-wide layout constants and theme entrypoints.
 * Semantic colors live in `src/theme/`; use `useTheme()` for runtime values.
 */

import { Platform } from 'react-native';

import { buildTheme, type ColorSchemeName, type ThemeColorKey } from '@/theme/build-theme';

export { buildTheme, type AppTheme, type ColorSchemeName, type ThemeColorKey } from '@/theme/build-theme';
export { darkPalette, lightPalette, type SemanticColor } from '@/theme/colors';
export { radius, type RadiusToken } from '@/theme/radius';
export { mono, sans, webSansStack } from '@/theme/fonts';

export const Colors = {
  light: buildTheme('light'),
  dark: buildTheme('dark'),
} as const;

export function themeForScheme(scheme: ColorSchemeName | null | undefined) {
  const resolved: ColorSchemeName = scheme === 'dark' ? 'dark' : 'light';
  return Colors[resolved];
}

/** Background / foreground keys for `ThemedView` and `ThemedText`. */
export type ThemeColor = ThemeColorKey;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
