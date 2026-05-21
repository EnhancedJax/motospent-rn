import { Platform } from 'react-native';

/**
 * Sans faces from `@expo-google-fonts/google-sans` (loaded in root layout via `useFonts`).
 * Use these `fontFamily` values after fonts have finished loading.
 */
export const sans = {
  regular: 'GoogleSans_400Regular',
  medium: 'GoogleSans_500Medium',
  semibold: 'GoogleSans_600SemiBold',
  bold: 'GoogleSans_700Bold',
} as const;

/** CSS stack for plain DOM / `global.css` (Google Sans is also loaded via Google Fonts on web). */
export const webSansStack =
  '"Google Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

/** Monospace stack for inline `code` text. */
export const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
  web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
});
