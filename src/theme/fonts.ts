import { Platform } from 'react-native';

const googleSans = {
  regular: 'GoogleSans_400Regular',
  medium: 'GoogleSans_500Medium',
  semibold: 'GoogleSans_600SemiBold',
  bold: 'GoogleSans_700Bold',
} as const;

/** System default on iOS/web; Google Sans on Android (loaded in root layout via `useFonts`). */
const systemSans = {
  regular: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
} as const;

/**
 * Sans `fontFamily` for React Native text. On Android, use after `useFonts` has finished.
 * On iOS and web, leave undefined so `fontWeight` maps to the platform system face.
 */
export const sans = Platform.OS === 'android' ? googleSans : systemSans;

/** CSS stack for plain DOM / `global.css`. */
export const webSansStack =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

/** Monospace stack for inline `code` text. */
export const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
  web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
});
