/** Matches `--radius: 0.45rem` at a 16px rem baseline (common for mobile). */
const rem = 16;
const radiusBase = 0.45 * rem;

export const radius = {
  /** Base token (maps to `--radius` / `radius-lg` in CSS) */
  base: radiusBase,
  sm: 0.45 * 0.6 * rem,
  md: 0.45 * 0.8 * rem,
  lg: radiusBase,
  xl: 0.45 * 1.4 * rem,
  '2xl': 0.45 * 1.8 * rem,
  '3xl': 0.45 * 2.2 * rem,
  '4xl': 0.45 * 2.6 * rem,
} as const;

export type RadiusToken = keyof typeof radius;
