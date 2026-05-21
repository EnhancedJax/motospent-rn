import { darkPalette, lightPalette, type SemanticColor } from '@/theme/colors';
import { mono, sans, webSansStack } from '@/theme/fonts';
import { radius } from '@/theme/radius';

export type ColorSchemeName = 'light' | 'dark';

/** Names used by older starter components, mapped onto semantic tokens. */
export type LegacyColor =
  | 'text'
  | 'textSecondary'
  | 'backgroundElement'
  | 'backgroundSelected';

export type ThemeColorKey = SemanticColor | LegacyColor;

/** Runtime palette: semantic tokens plus legacy aliases (string values differ by light/dark). */
export type ThemeColors = Record<SemanticColor, string> & Record<LegacyColor, string>;

const legacyFromSemantic = (p: (typeof lightPalette) | (typeof darkPalette)) =>
  ({
    text: p.foreground,
    textSecondary: p.mutedForeground,
    backgroundElement: p.muted,
    backgroundSelected: p.accent,
  }) as const;

export type AppTheme = {
  scheme: ColorSchemeName;
  colors: ThemeColors;
  radius: typeof radius;
  sans: typeof sans;
  mono: typeof mono;
  webSansStack: typeof webSansStack;
};

/** Flattened color keys at the top level for ergonomic `theme.foreground` access. */
export type ResolvedTheme = AppTheme & ThemeColors;

export function buildTheme(scheme: ColorSchemeName): ResolvedTheme {
  const base = scheme === 'dark' ? darkPalette : lightPalette;
  const legacy = legacyFromSemantic(base);
  const colors = { ...base, ...legacy } as ThemeColors;

  return {
    scheme,
    colors,
    radius,
    sans,
    mono,
    webSansStack,
    ...colors,
  };
}
