import type { ResolvedTheme } from '@/theme/build-theme';

export function getChartColors(theme: ResolvedTheme): string[] {
  return [theme.chart1, theme.chart2, theme.chart3, theme.chart4, theme.chart5];
}

export function getChartAxisStyle(theme: ResolvedTheme) {
  return {
    color: theme.mutedForeground,
    fontSize: 10,
  };
}
