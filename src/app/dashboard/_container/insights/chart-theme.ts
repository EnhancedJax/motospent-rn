export function computeBarSpacing(barCount: number, chartWidth: number): number {
  if (barCount <= 1) {
    return 40;
  }
  const available = chartWidth - 40;
  return Math.max(16, Math.min(48, available / barCount));
}

export function computeChartWidth(containerWidth: number, minWidth = 280): number {
  return Math.max(minWidth, containerWidth - 32);
}
