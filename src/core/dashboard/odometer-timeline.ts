import type { ExpenseDTO } from '@/core/database/types';
import { fromStorageKm } from '@/core/units/distance';
import type { DistanceUnit } from '@/core/units/types';

import { compareExpensesChronological, isAnalyticsExpense } from './expense-filters';
import { formatDayLabel, startOfDay } from './period-buckets';
import type { OdometerTimelinePoint, OdometerTimelineResult } from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function linearRegressionSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) {
    return 0;
  }
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return 0;
  }
  return (n * sumXY - sumX * sumY) / denominator;
}

export function computeOdometerTimeline(params: {
  expenses: ExpenseDTO[];
  distanceUnit: DistanceUnit;
}): OdometerTimelineResult {
  const { expenses, distanceUnit } = params;

  const withOdometer = expenses
    .filter((e) => isAnalyticsExpense(e) && e.odometerKm >= 0)
    .sort(compareExpensesChronological);

  if (withOdometer.length === 0) {
    return { kind: 'empty' };
  }

  if (withOdometer.length === 1) {
    const only = withOdometer[0];
    return {
      kind: 'single',
      reading: fromStorageKm(only.odometerKm, distanceUnit),
      date: only.date,
    };
  }

  const firstDay = startOfDay(withOdometer[0].date);
  const lastDay = startOfDay(withOdometer[withOdometer.length - 1].date);
  const dayCount = Math.round((lastDay - firstDay) / MS_PER_DAY) + 1;

  if (dayCount < 2) {
    const latest = withOdometer[withOdometer.length - 1];
    return {
      kind: 'single',
      reading: fromStorageKm(latest.odometerKm, distanceUnit),
      date: latest.date,
    };
  }

  const readingsByDay = new Map<number, ExpenseDTO>();
  for (const expense of withOdometer) {
    const day = startOfDay(expense.date);
    const existing = readingsByDay.get(day);
    if (
      !existing ||
      expense.date > existing.date ||
      (expense.date === existing.date && expense.createdAt > existing.createdAt)
    ) {
      readingsByDay.set(day, expense);
    }
  }

  const expenseReadingCount = readingsByDay.size;
  const showDataPoints = expenseReadingCount <= 20;

  const points: OdometerTimelinePoint[] = [];
  const displayValues: number[] = [];
  let lastOdometerKm = withOdometer[0].odometerKm;

  for (let i = 0; i < dayCount; i++) {
    const dayMs = firstDay + i * MS_PER_DAY;
    const dayExpense = readingsByDay.get(dayMs);
    const hasReading = dayExpense !== undefined;

    if (hasReading && dayExpense) {
      lastOdometerKm = dayExpense.odometerKm;
    }

    const odometerDisplay = fromStorageKm(lastOdometerKm, distanceUnit);
    displayValues.push(odometerDisplay);

    const labelInterval = Math.max(1, Math.ceil(dayCount / 6));
    points.push({
      date: dayMs,
      odometerDisplay,
      hasReading,
      label: i % labelInterval === 0 || i === dayCount - 1 ? formatDayLabel(dayMs) : '',
    });
  }

  const slope = linearRegressionSlope(displayValues);
  const firstValue = displayValues[0] ?? 0;
  const trendPoints = displayValues.map((_, i) => firstValue + slope * i);

  return {
    kind: 'chart',
    points,
    trendPoints,
    avgDailyIncrease: slope,
    showDataPoints,
  };
}
