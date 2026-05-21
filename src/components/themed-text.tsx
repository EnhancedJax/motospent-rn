import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

function resolveSansFamily(type: NonNullable<ThemedTextProps['type']>, theme: ReturnType<typeof useTheme>) {
  switch (type) {
    case 'title':
    case 'subtitle':
      return theme.sans.semibold;
    case 'smallBold':
      return theme.sans.bold;
    case 'code':
      return typeof theme.mono === 'string' ? theme.mono : 'monospace';
    default:
      return theme.sans.medium;
  }
}

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const sansFamily = resolveSansFamily(type, theme);

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'], fontFamily: sansFamily },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && [styles.link, { color: theme.primary }],
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  title: {
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 44,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  code: {
    fontWeight: Platform.select({ android: '700', default: '500' }),
    fontSize: 12,
  },
});
